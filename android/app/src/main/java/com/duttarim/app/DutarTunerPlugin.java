package com.duttarim.app;

import android.Manifest;
import android.content.pm.ActivityInfo;
import android.media.AudioFormat;
import android.media.AudioRecord;
import android.media.MediaRecorder;
import android.os.Process;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@CapacitorPlugin(
        name = "DutarTuner",
        permissions = {
                @Permission(
                        alias = "microphone",
                        strings = {Manifest.permission.RECORD_AUDIO}
                )
        }
)
public class DutarTunerPlugin extends Plugin {

    private static final String TAG = "DutarTuner";

    @PluginMethod
    public void setNoteDetailOrientation(PluginCall call) {
        boolean allowRotation =
                Boolean.TRUE.equals(
                        call.getBoolean("allowRotation")
                );

        getActivity().runOnUiThread(() -> {
            getActivity().setRequestedOrientation(
                    allowRotation
                            ? ActivityInfo.SCREEN_ORIENTATION_FULL_SENSOR
                            : ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
            );
            call.resolve();
        });
    }

    /*
     * =========================================================
     * AUDIO
     * =========================================================
     */

    private static final int SAMPLE_RATE = 44100;

    /*
     * AudioRecord her seferinde 2048 sample okuyor.
     *
     * ~46 ms
     */
    private static final int READ_SIZE = 2048;

    /*
     * YIN ise son 4096 sample üzerinde çalışıyor.
     *
     * ~93 ms ses görüyor.
     *
     * Böylece:
     * - düşük frekans accuracy artıyor
     * - ama UI update yaklaşık 46 ms'de bir devam ediyor
     */
    private static final int ANALYSIS_SIZE = 4096;

    /*
     * Çok düşük background noise'u YIN'e sokmuyoruz.
     */
    private static final double RMS_THRESHOLD = 0.0012;


    /*
     * =========================================================
     * YIN
     * =========================================================
     */

    /*
     * Dutarın gerçek çalışma alanı.
     *
     * Açık teller:
     *
     * D3 = 146.83 Hz
     * G3 = 196.00 Hz
     * A3 = 220.00 Hz
     *
     * Perdeler yukarı çıktıkça frekans artıyor.
     *
     * 110 Hz altını özellikle almıyoruz.
     * Böylece daha önce gördüğümüz:
     *
     * 65 Hz
     * 83 Hz
     * 98 Hz
     *
     * gibi subharmonic sonuçların büyük kısmı
     * daha YIN aşamasında eleniyor.
     */
    private static final double MIN_DETECT_FREQUENCY = 110.0;
    private static final double MAX_DETECT_FREQUENCY = 500.0;

    /*
     * YIN threshold.
     *
     * Daha düşük = daha katı.
     */
    private static final double YIN_THRESHOLD = 0.25;

    /*
     * Pitch kabulü için minimum güven.
     */
    private static final double MIN_CONFIDENCE = 0.72;


    /*
     * =========================================================
     * TEMPORAL STABILIZER
     *
     * =========================================================
     */
    private static final long PITCH_HOLD_MS = 2200;
    private static final double CONTINUATION_CONFIDENCE = 0.50;

    /*
     * Son 5 düzgün pitch'in median'ı.
     */
    private static final int HISTORY_SIZE = 3;

    /*
     * Yeni ölçüm mevcut stabil pitch'ten
     * 100 centten az farklıysa aynı pitch bölgesi
     * olarak değerlendiriyoruz.
     */
    private static final double SAME_PITCH_CENTS = 35.0;

    /*
     * Yeni bir pitch'e geçiş sırasında ardışık
     * ölçümlerin birbirine ne kadar yakın olması gerekiyor.
     */
    private static final double CANDIDATE_MATCH_CENTS = 40.0;

    /*
     * Normal nota değişikliği için 3 ardışık frame.
     *
     * 2048 hop ile yaklaşık:
     *
     * 3 × 46 ms = 138 ms
     */
    private static final int SWITCH_CONFIRM_FRAMES = 2;

    /*
     * Eğer yeni frekans eski frekansın tam
     * 1/2, 1/3, 2x veya 3x civarındaysa,
     * bunun harmonic/subharmonic glitch olma
     * ihtimali daha yüksek.
     *
     * Frekansı zorla düzeltmiyoruz.
     * Sadece daha uzun doğruluyoruz.
     */
    private static final int HARMONIC_SWITCH_CONFIRM_FRAMES = 4;

    private static final double HARMONIC_TOLERANCE_CENTS = 45.0;


    /*
     * =========================================================
     * STATE
     * =========================================================
     */
    private long lastReliablePitchTime = 0;

    private volatile boolean running = false;

    private AudioRecord recorder;
    private Thread audioThread;

    /*
     * Median history.
     */
    private final ArrayDeque<Double> pitchHistory =
            new ArrayDeque<>();

    /*
     * Şu anda kullanıcıya güvenilir kabul ettiğimiz
     * stabil frekans.
     */
    private double stableFrequency = -1.0;

    /*
     * Farklı bir nota algılandığında birkaç frame
     * doğrulamak için candidate.
     */
    private double candidateFrequency = -1.0;
    private int candidateFrames = 0;


    /*
     * =========================================================
     * PITCH RESULT
     * =========================================================
     */

    private static class PitchResult {

        final double frequency;
        final double confidence;

        PitchResult(
                double frequency,
                double confidence
        ) {

            this.frequency = frequency;
            this.confidence = confidence;
        }
    }


    /*
     * =========================================================
     * START
     * =========================================================
     */

    @PluginMethod
    public void start(PluginCall call) {

        Log.d(TAG, "start() called");

        PermissionState permissionState =
                getPermissionState("microphone");

        Log.d(
                TAG,
                "Microphone permission="
                        + permissionState
        );

        /*
         * Plugin kendi kendine permission istemiyor.
         */
        if (
                permissionState
                        != PermissionState.GRANTED
        ) {

            Log.e(
                    TAG,
                    "Microphone permission NOT granted"
            );

            call.reject(
                    "Microphone permission is required"
            );

            return;
        }

        /*
         * start() iki kez çağrılırsa ikinci recorder açma.
         */
        if (running) {

            Log.d(
                    TAG,
                    "Recorder already running"
            );

            call.resolve();

            return;
        }

        cleanupOldRecorder();

        resetPitchStabilizer();

        int minimum =
                AudioRecord.getMinBufferSize(
                        SAMPLE_RATE,
                        AudioFormat.CHANNEL_IN_MONO,
                        AudioFormat.ENCODING_PCM_16BIT
                );

        if (minimum <= 0) {

            Log.e(
                    TAG,
                    "Invalid minBuffer="
                            + minimum
            );

            call.reject(
                    "Invalid audio buffer size"
            );

            return;
        }

        /*
         * Native AudioRecord buffer'ı analiz penceresinden
         * daha büyük tutuyoruz.
         */
        int bufferSize =
                Math.max(
                        minimum,
                        ANALYSIS_SIZE * 2
                );

        Log.d(
                TAG,
                "minBuffer="
                        + minimum
                        + " selectedBuffer="
                        + bufferSize
        );


        /*
         * =====================================================
         * UNPROCESSED
         * =====================================================
         */

        recorder =
                createRecorder(
                        MediaRecorder.AudioSource.UNPROCESSED,
                        bufferSize
                );

        if (
                recorder != null
                        &&
                        recorder.getState()
                                ==
                                AudioRecord.STATE_INITIALIZED
        ) {

            Log.d(
                    TAG,
                    "Using UNPROCESSED audio source"
            );

        } else {

            /*
             * =================================================
             * FALLBACK
             * =================================================
             */

            Log.w(
                    TAG,
                    "UNPROCESSED unavailable. "
                            + "Falling back to VOICE_RECOGNITION"
            );

            if (recorder != null) {

                try {
                    recorder.release();
                } catch (Exception ignored) {
                }

                recorder = null;
            }

            recorder =
                    createRecorder(
                            MediaRecorder.AudioSource.VOICE_RECOGNITION,
                            bufferSize
                    );
        }


        /*
         * Recorder hâlâ initialize olmadı.
         */
        if (
                recorder == null
                        ||
                        recorder.getState()
                                != AudioRecord.STATE_INITIALIZED
        ) {

            Log.e(
                    TAG,
                    "AudioRecord initialization FAILED"
            );

            if (recorder != null) {

                try {
                    recorder.release();
                } catch (Exception ignored) {
                }
            }

            recorder = null;

            call.reject(
                    "Audio recorder could not be initialized"
            );

            return;
        }


        /*
         * =====================================================
         * START RECORDING
         * =====================================================
         */

        try {

            recorder.startRecording();

        } catch (
                IllegalStateException |
                SecurityException error
        ) {

            Log.e(
                    TAG,
                    "startRecording() FAILED",
                    error
            );

            try {
                recorder.release();
            } catch (Exception ignored) {
            }

            recorder = null;

            call.reject(
                    "Audio recording could not be started"
            );

            return;
        }


        if (
                recorder.getRecordingState()
                        !=
                        AudioRecord.RECORDSTATE_RECORDING
        ) {

            Log.e(
                    TAG,
                    "AudioRecord not in RECORDING state"
            );

            try {
                recorder.release();
            } catch (Exception ignored) {
            }

            recorder = null;

            call.reject(
                    "Audio recording did not start"
            );

            return;
        }


        running = true;

        audioThread =
                new Thread(
                        this::captureLoop,
                        "DutarPitchDetector"
                );

        audioThread.start();

        Log.d(
                TAG,
                "Audio recording started successfully"
        );

        call.resolve();
    }


    /*
     * =========================================================
     * CREATE RECORDER
     * =========================================================
     */

    private AudioRecord createRecorder(
            int source,
            int bufferSize
    ) {

        try {

            Log.d(
                    TAG,
                    "Creating AudioRecord"
                            + " source=" + source
                            + " buffer=" + bufferSize
            );

            return new AudioRecord(
                    source,
                    SAMPLE_RATE,
                    AudioFormat.CHANNEL_IN_MONO,
                    AudioFormat.ENCODING_PCM_16BIT,
                    bufferSize
            );

        } catch (
                IllegalArgumentException |
                SecurityException error
        ) {

            Log.e(
                    TAG,
                    "createRecorder() failed"
                            + " source=" + source,
                    error
            );

            return null;
        }
    }


    /*
     * =========================================================
     * CAPTURE LOOP
     * =========================================================
     */

    private void captureLoop() {

        Log.d(
                TAG,
                "captureLoop ENTER"
        );

        Process.setThreadPriority(
                Process.THREAD_PRIORITY_AUDIO
        );

        /*
         * AudioRecord buraya okuyor.
         */
        short[] readBuffer =
                new short[READ_SIZE];

        /*
         * YIN bunun üzerinde çalışıyor.
         */
        short[] analysisBuffer =
                new short[ANALYSIS_SIZE];

        int filledSamples = 0;

        int consecutiveReadErrors = 0;

        long analysisCounter = 0;


        while (
                running
                        &&
                        recorder != null
        ) {

            int read;

            try {

                read =
                        recorder.read(
                                readBuffer,
                                0,
                                readBuffer.length
                        );

            } catch (
                    IllegalStateException error
            ) {

                Log.e(
                        TAG,
                        "AudioRecord.read() exception",
                        error
                );

                break;
            }


            /*
             * =================================================
             * AUDIO READ ERRORS
             * =================================================
             */

            if (read < 0) {

                consecutiveReadErrors++;

                Log.w(
                        TAG,
                        "AudioRecord read error="
                                + read
                                + " consecutive="
                                + consecutiveReadErrors
                );

                if (
                        read
                                ==
                                AudioRecord.ERROR_DEAD_OBJECT
                ) {

                    Log.e(
                            TAG,
                            "ERROR_DEAD_OBJECT"
                    );

                    break;
                }

                if (
                        consecutiveReadErrors
                                >= 20
                ) {

                    Log.e(
                            TAG,
                            "Too many consecutive read errors"
                    );

                    break;
                }

                continue;
            }


            if (read == 0) {
                continue;
            }

            consecutiveReadErrors = 0;


            /*
             * =================================================
             * BUILD 4096-SAMPLE SLIDING WINDOW
             * =================================================
             */

            if (
                    filledSamples
                            <
                            ANALYSIS_SIZE
            ) {

                int copy =
                        Math.min(
                                read,
                                ANALYSIS_SIZE - filledSamples
                        );

                System.arraycopy(
                        readBuffer,
                        0,
                        analysisBuffer,
                        filledSamples,
                        copy
                );

                filledSamples += copy;

                /*
                 * İlk 4096 sample dolmadan YIN çalıştırma.
                 */
                if (
                        filledSamples
                                <
                                ANALYSIS_SIZE
                ) {

                    continue;
                }

            } else {

                /*
                 * Eski 2048 sample'ı at.
                 * Yeni 2048 sample'ı sona koy.
                 */
                int shift =
                        Math.min(
                                read,
                                ANALYSIS_SIZE
                        );

                System.arraycopy(
                        analysisBuffer,
                        shift,
                        analysisBuffer,
                        0,
                        ANALYSIS_SIZE - shift
                );

                System.arraycopy(
                        readBuffer,
                        0,
                        analysisBuffer,
                        ANALYSIS_SIZE - shift,
                        shift
                );
            }


            /*
             * =================================================
             * SIGNAL HEALTH
             * =================================================
             */

            double rms =
                    calculateRms(
                            analysisBuffer,
                            ANALYSIS_SIZE
                    );


            PitchResult rawPitch = null;

            if (
                    rms
                            >
                            RMS_THRESHOLD
            ) {

                rawPitch =
                        detectPitchYin(
                                analysisBuffer,
                                ANALYSIS_SIZE
                        );
            }


            double rawFrequency =
                    rawPitch != null
                            ? rawPitch.frequency
                            : -1.0;

            double confidence =
                    rawPitch != null
                            ? rawPitch.confidence
                            : 0.0;


            /*
             * =================================================
             * CONFIDENCE FILTER
             * =================================================
             */

            boolean strongPitch =
                    rawPitch != null
                            &&
                            confidence >= MIN_CONFIDENCE;

            /*
             * Güçlü bir tel sesi yakalandığı anda
             * decay takip penceresini yenile.
             */
            if (strongPitch) {

                lastReliablePitchTime =
                        System.currentTimeMillis();
            }

            /*
             * Bir tel daha önce güvenilir biçimde yakalandıysa
             * yaklaşık 2.2 saniyelik decay penceresi açılır.
             *
             * Burada notanın doğru D/G/A olması gerekmiyor.
             */
            boolean withinDecayWindow =
                    stableFrequency > 0
                            &&
                            lastReliablePitchTime > 0
                            &&
                            System.currentTimeMillis()
                                    - lastReliablePitchTime
                                    <= PITCH_HOLD_MS;

            /*
             * Telin sesi sönerken confidence düşebilir.
             *
             * YIN hâlâ gerçek bir pitch üretiyorsa,
             * decay penceresi içinde daha düşük confidence
             * ile takibe devam ediyoruz.
             */
            boolean continuationPitch =
                    rawPitch != null
                            &&
                            confidence >= CONTINUATION_CONFIDENCE
                            &&
                            withinDecayWindow;

            boolean pitchReliable =
                    strongPitch
                            ||
                            continuationPitch;

            /*
             * =================================================
             * TEMPORAL STABILIZER
             * =================================================
             */

            double outputFrequency = -1.0;

            if (pitchReliable) {

                outputFrequency =
                        stabilizePitch(
                                rawFrequency
                        );
            }


            /*
             * =================================================
             * DEBUG
             * =================================================
             */

            if (
                    analysisCounter % 10
                            == 0
            ) {

                Log.d(
                        TAG,
                        "PITCH"
                                + " raw="
                                + rawFrequency
                                + " stable="
                                + stableFrequency
                                + " output="
                                + outputFrequency
                                + " conf="
                                + confidence
                                + " rms="
                                + rms
                );
            }


            /*
             * =================================================
             * JS EVENT
             * =================================================
             */

            JSObject payload =
                    new JSObject();

            /*
             * UI bununla çalışıyor.
             */
            payload.put(
                    "frequency",
                    outputFrequency > 0
                            ? outputFrequency
                            : 0
            );

            /*
             * Debug / ileride advanced tuner için.
             */
            payload.put(
                    "rawFrequency",
                    rawFrequency > 0
                            ? rawFrequency
                            : 0
            );

            payload.put(
                    "confidence",
                    confidence
            );

            payload.put(
                    "rms",
                    rms
            );

            notifyListeners(
                    "pitch",
                    payload
            );

            analysisCounter++;
        }


        Log.d(
                TAG,
                "captureLoop EXIT"
                        + " running="
                        + running
        );

        running = false;
    }


    /*
     * =========================================================
     * TEMPORAL STABILIZER
     * =========================================================
     */

    private double stabilizePitch(
            double rawFrequency
    ) {

        if (
                rawFrequency <= 0
                        ||
                        !Double.isFinite(rawFrequency)
        ) {

            return -1.0;
        }


        /*
         * İlk geçerli pitch.
         */
        if (
                stableFrequency <= 0
        ) {

            addPitchToHistory(
                    rawFrequency
            );

            stableFrequency =
                    medianHistory();

            resetCandidate();

            return stableFrequency;
        }


        double centsFromStable =
                centsDistance(
                        rawFrequency,
                        stableFrequency
                );


        /*
         * =====================================================
         * SAME PITCH AREA
         * =====================================================
         */

        if (
                Math.abs(centsFromStable)
                        <=
                        SAME_PITCH_CENTS
        ) {

            /*
             * Normal ufak fluctuation.
             */
            addPitchToHistory(
                    rawFrequency
            );

            stableFrequency =
                    medianHistory();

            resetCandidate();

            return stableFrequency;
        }


        /*
         * =====================================================
         * POSSIBLE NEW NOTE
         * =====================================================
         *
         * Kullanıcı farklı perdeye basmış olabilir.
         *
         * Tek frame'de doğrudan geçmiyoruz.
         */


        if (
                candidateFrequency <= 0
        ) {

            candidateFrequency =
                    rawFrequency;

            candidateFrames =
                    1;

            return -1.0;
        }


        double candidateDifference =
                Math.abs(
                        centsDistance(
                                rawFrequency,
                                candidateFrequency
                        )
                );


        if (
                candidateDifference
                        <=
                        CANDIDATE_MATCH_CENTS
        ) {

            /*
             * Aynı yeni pitch birkaç frame
             * üst üste geliyor.
             */
            candidateFrames++;

            /*
             * Candidate median benzeri yumuşak
             * update.
             */
            candidateFrequency =
                    (
                            candidateFrequency
                                    +
                                    rawFrequency
                    )
                            /
                            2.0;

        } else {

            /*
             * Önceki candidate da glitch olabilir.
             *
             * Yeni candidate başlat.
             */
            candidateFrequency =
                    rawFrequency;

            candidateFrames =
                    1;

            return -1.0;
        }


        /*
         * Harmonic / subharmonic ilişkisi var mı?
         */
        boolean harmonicRelation =
                isSuspiciousHarmonicRelation(
                        candidateFrequency,
                        stableFrequency
                );


        int requiredFrames =
                harmonicRelation
                        ?
                        HARMONIC_SWITCH_CONFIRM_FRAMES
                        :
                        SWITCH_CONFIRM_FRAMES;


        if (
                candidateFrames
                        <
                        requiredFrames
        ) {

            return -1.0;
        }


        /*
         * =====================================================
         * CONFIRMED NOTE CHANGE
         * =====================================================
         */

        Log.d(
                TAG,
                "NOTE CHANGE"
                        + " old="
                        + stableFrequency
                        + " new="
                        + candidateFrequency
                        + " frames="
                        + candidateFrames
                        + " harmonicRelation="
                        + harmonicRelation
        );


        pitchHistory.clear();

        addPitchToHistory(
                candidateFrequency
        );

        stableFrequency =
                candidateFrequency;

        resetCandidate();

        return stableFrequency;
    }


    /*
     * =========================================================
     * MEDIAN FILTER
     * =========================================================
     */

    private void addPitchToHistory(
            double frequency
    ) {

        pitchHistory.addLast(
                frequency
        );

        while (
                pitchHistory.size()
                        >
                        HISTORY_SIZE
        ) {

            pitchHistory.removeFirst();
        }
    }


    private double medianHistory() {

        if (
                pitchHistory.isEmpty()
        ) {

            return -1.0;
        }

        List<Double> values =
                new ArrayList<>(
                        pitchHistory
                );

        Collections.sort(
                values
        );

        int size =
                values.size();

        if (
                size % 2
                        ==
                        1
        ) {

            return values.get(
                    size / 2
            );
        }

        return (
                values.get(
                        size / 2 - 1
                )
                        +
                        values.get(
                                size / 2
                        )
        )
                /
                2.0;
    }


    /*
     * =========================================================
     * HARMONIC RELATION CHECK
     * =========================================================
     *
     * Burada frekansı değiştirmiyoruz.
     *
     * Sadece:
     *
     * f / 2
     * f / 3
     * 2f
     * 3f
     *
     * gibi durumlarda yeni notaya geçmek için biraz daha
     * fazla doğrulama istiyoruz.
     */

    private boolean isSuspiciousHarmonicRelation(
            double frequencyA,
            double frequencyB
    ) {

        if (
                frequencyA <= 0
                        ||
                        frequencyB <= 0
        ) {

            return false;
        }

        double ratio =
                frequencyA
                        /
                        frequencyB;

        /*
         * Hangi taraf yüksek olursa olsun ratio >= 1.
         */
        if (ratio < 1.0) {
            ratio = 1.0 / ratio;
        }

        return (
                closeToRatio(
                        ratio,
                        2.0
                )
                        ||
                        closeToRatio(
                                ratio,
                                3.0
                        )
        );
    }


    private boolean closeToRatio(
            double actualRatio,
            double expectedRatio
    ) {

        double cents =
                1200.0
                        *
                        (
                                Math.log(
                                        actualRatio
                                                /
                                                expectedRatio
                                )
                                        /
                                        Math.log(2.0)
                        );

        return Math.abs(cents)
                <=
                HARMONIC_TOLERANCE_CENTS;
    }


    /*
     * =========================================================
     * CENT DISTANCE
     * =========================================================
     */

    private double centsDistance(
            double frequency,
            double reference
    ) {

        if (
                frequency <= 0
                        ||
                        reference <= 0
        ) {

            return 0.0;
        }

        return 1200.0
                *
                (
                        Math.log(
                                frequency
                                        /
                                        reference
                        )
                                /
                                Math.log(2.0)
                );
    }


    /*
     * =========================================================
     * RMS
     * =========================================================
     *
     * DC bias'i RMS'e katmamak için önce mean hesaplıyoruz.
     */

    private double calculateRms(
            short[] data,
            int length
    ) {

        double mean = 0.0;

        for (
                int i = 0;
                i < length;
                i++
        ) {

            mean += data[i];
        }

        mean /= length;


        double sum = 0.0;

        for (
                int i = 0;
                i < length;
                i++
        ) {

            double sample =
                    (
                            data[i]
                                    -
                                    mean
                    )
                            /
                            32768.0;

            sum +=
                    sample
                            *
                            sample;
        }


        return Math.sqrt(
                sum / length
        );
    }


    /*
     * =========================================================
     * YIN
     * =========================================================
     */

    private PitchResult detectPitchYin(
            short[] data,
            int length
    ) {

        int minLag =
                (int) Math.floor(
                        SAMPLE_RATE
                                /
                                MAX_DETECT_FREQUENCY
                );

        int maxLag =
                (int) Math.ceil(
                        SAMPLE_RATE
                                /
                                MIN_DETECT_FREQUENCY
                );


        maxLag =
                Math.min(
                        maxLag,
                        length / 2
                );


        if (
                minLag < 2
                        ||
                        maxLag <= minLag + 2
        ) {

            return null;
        }


        /*
         * Her lag için aynı miktarda sample kullanıyoruz.
         *
         * Bu, farklı lag'lerde farklı sample count
         * kullanılmasından doğan bias'i azaltır.
         */
        int comparisonLength =
                length - maxLag;


        if (
                comparisonLength <= 0
        ) {

            return null;
        }


        double[] yin =
                new double[
                        maxLag + 1
                        ];


        /*
         * =====================================================
         * 1. DIFFERENCE FUNCTION
         * =====================================================
         */

        for (
                int lag = 1;
                lag <= maxLag;
                lag++
        ) {

            double sum = 0.0;

            for (
                    int i = 0;
                    i < comparisonLength;
                    i++
            ) {

                double difference =
                        (
                                data[i]
                                        -
                                        data[i + lag]
                        )
                                /
                                32768.0;

                sum +=
                        difference
                                *
                                difference;
            }

            yin[lag] =
                    sum;
        }


        /*
         * =====================================================
         * 2. CUMULATIVE MEAN NORMALIZED DIFFERENCE
         * =====================================================
         */

        yin[0] = 1.0;

        double runningSum =
                0.0;


        for (
                int lag = 1;
                lag <= maxLag;
                lag++
        ) {

            runningSum +=
                    yin[lag];


            if (
                    runningSum <= 0.0
                            ||
                            !Double.isFinite(
                                    runningSum
                            )
            ) {

                yin[lag] =
                        1.0;

            } else {

                yin[lag] =
                        yin[lag]
                                *
                                lag
                                /
                                runningSum;
            }
        }


        /*
         * =====================================================
         * 3. THRESHOLD SEARCH
         * =====================================================
         */

        int bestLag = -1;


        for (
                int lag = minLag;
                lag < maxLag;
                lag++
        ) {

            if (
                    yin[lag]
                            <
                            YIN_THRESHOLD
            ) {

                /*
                 * Threshold'ın altına girdik.
                 *
                 * Aynı valley içindeki gerçek minimuma
                 * ilerliyoruz.
                 */
                while (
                        lag + 1 < maxLag
                                &&
                                yin[lag + 1]
                                        <
                                        yin[lag]
                ) {

                    lag++;
                }

                bestLag =
                        lag;

                break;
            }
        }


        /*
         * Threshold crossing bulunamadıysa,
         * çalışma aralığındaki en iyi YIN minimumunu dene.
         *
         * Bu sonucu körü körüne kabul etmiyoruz.
         * Aşağıdaki confidence filtresi yine kontrol edecek.
         */
        if (bestLag < 0) {

            double bestValue =
                    Double.MAX_VALUE;

            int bestCandidate =
                    -1;

            for (
                    int lag = minLag + 1;
                    lag < maxLag;
                    lag++
            ) {

                /*
                 * Sadece gerçek local minimumlara bak.
                 */
                if (
                        yin[lag] <= yin[lag - 1]
                                &&
                                yin[lag] <= yin[lag + 1]
                                &&
                                yin[lag] < bestValue
                ) {

                    bestValue =
                            yin[lag];

                    bestCandidate =
                            lag;
                }
            }

            /*
             * Aşırı kötü bir minimumsa pitch olarak
             * değerlendirmeye bile alma.
             *
             * confidence = 1 - yin
             *
             * 0.40 YIN => 0.60 confidence
             */
            if (
                    bestCandidate < 0
                            ||
                            bestValue > 0.40
            ) {

                return null;
            }

            bestLag =
                    bestCandidate;
        }


        /*
         * =====================================================
         * 4. CONFIDENCE
         * =====================================================
         */

        double confidence =
                1.0
                        -
                        yin[bestLag];


        if (
                !Double.isFinite(
                        confidence
                )
                        ||
                        confidence < 0.0
        ) {

            return null;
        }


        confidence =
                Math.max(
                        0.0,
                        Math.min(
                                1.0,
                                confidence
                        )
                );


        /*
         * =====================================================
         * 5. PARABOLIC INTERPOLATION
         * =====================================================
         */

        int left =
                Math.max(
                        1,
                        bestLag - 1
                );

        int right =
                Math.min(
                        maxLag,
                        bestLag + 1
                );


        double s0 =
                yin[left];

        double s1 =
                yin[bestLag];

        double s2 =
                yin[right];


        double denominator =
                2.0 * s1
                        -
                        s2
                        -
                        s0;


        double refinedLag =
                bestLag;


        if (
                Math.abs(
                        denominator
                )
                        >
                        1e-12
                        &&
                        Double.isFinite(
                                denominator
                        )
        ) {

            double correction =
                    (
                            s2 - s0
                    )
                            /
                            (
                                    2.0
                                            *
                                            denominator
                            );


            if (
                    Double.isFinite(
                            correction
                    )
                            &&
                            Math.abs(
                                    correction
                            )
                                    <=
                                    1.0
            ) {

                refinedLag +=
                        correction;
            }
        }


        if (
                refinedLag <= 0.0
                        ||
                        !Double.isFinite(
                                refinedLag
                        )
        ) {

            return null;
        }


        /*
         * =====================================================
         * 6. FREQUENCY
         * =====================================================
         */

        double frequency =
                SAMPLE_RATE
                        /
                        refinedLag;


        if (
                !Double.isFinite(
                        frequency
                )
                        ||
                        frequency
                                <
                                MIN_DETECT_FREQUENCY
                        ||
                        frequency
                                >
                                MAX_DETECT_FREQUENCY
        ) {

            return null;
        }


        return new PitchResult(
                frequency,
                confidence
        );
    }


    /*
     * =========================================================
     * RESET STABILIZER
     * =========================================================
     */

    private void resetPitchStabilizer() {

        pitchHistory.clear();

        stableFrequency =
                -1.0;

        lastReliablePitchTime =
                0;

        resetCandidate();
    }


    private void resetCandidate() {

        candidateFrequency =
                -1.0;

        candidateFrames =
                0;
    }


    /*
     * =========================================================
     * STOP
     * =========================================================
     */

    @PluginMethod
    public void stop(
            PluginCall call
    ) {

        Log.d(
                TAG,
                "stop() called"
        );

        stopRecorder();

        call.resolve();
    }


    private synchronized void stopRecorder() {

        Log.d(
                TAG,
                "stopRecorder()"
        );

        running = false;


        if (
                recorder != null
        ) {

            try {

                if (
                        recorder.getRecordingState()
                                ==
                                AudioRecord.RECORDSTATE_RECORDING
                ) {

                    recorder.stop();
                }

            } catch (
                    IllegalStateException error
            ) {

                Log.w(
                        TAG,
                        "AudioRecord.stop() error",
                        error
                );
            }


            try {

                recorder.release();

            } catch (
                    Exception ignored
            ) {
            }

            recorder = null;
        }


        if (
                audioThread != null
        ) {

            if (
                    Thread.currentThread()
                            !=
                            audioThread
            ) {

                try {

                    audioThread.join(
                            500
                    );

                } catch (
                        InterruptedException error
                ) {

                    Thread.currentThread()
                            .interrupt();
                }
            }

            audioThread =
                    null;
        }


        resetPitchStabilizer();


        Log.d(
                TAG,
                "Recorder completely stopped"
        );
    }


    /*
     * =========================================================
     * CLEAN OLD RECORDER
     * =========================================================
     */

    private void cleanupOldRecorder() {

        if (
                recorder == null
        ) {
            return;
        }


        try {

            if (
                    recorder.getRecordingState()
                            ==
                            AudioRecord.RECORDSTATE_RECORDING
            ) {

                recorder.stop();
            }

        } catch (
                Exception ignored
        ) {
        }


        try {

            recorder.release();

        } catch (
                Exception ignored
        ) {
        }


        recorder =
                null;
    }


    /*
     * =========================================================
     * DESTROY
     * =========================================================
     */

    @Override
    protected void handleOnDestroy() {

        Log.d(
                TAG,
                "Plugin destroyed"
        );

        stopRecorder();

        super.handleOnDestroy();
    }
}
