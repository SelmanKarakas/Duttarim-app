package com.duttarim.app;

import android.Manifest;
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

    private static final int SAMPLE_RATE = 44100;
    private static final int FRAME_SIZE = 2048;
    private static final double RMS_THRESHOLD = 0.0025;

    private volatile boolean running;
    private AudioRecord recorder;
    private Thread audioThread;

    @PluginMethod
    public void start(PluginCall call) {

        Log.d(TAG, "start() called");

        PermissionState permissionState = getPermissionState("microphone");
        Log.d(TAG, "Microphone permission = " + permissionState);

        if (permissionState != PermissionState.GRANTED) {
            Log.e(TAG, "Microphone permission NOT granted");
            call.reject("Microphone permission is required");
            return;
        }

        if (running) {
            Log.d(TAG, "Recorder already running");
            call.resolve();
            return;
        }

        if (recorder != null) {
            Log.d(TAG, "Releasing previous AudioRecord");

            try {
                recorder.release();
            } catch (Exception ignored) {
            }

            recorder = null;
        }

        int minimum = AudioRecord.getMinBufferSize(
                SAMPLE_RATE,
                AudioFormat.CHANNEL_IN_MONO,
                AudioFormat.ENCODING_PCM_16BIT
        );

        int bufferSize = Math.max(minimum, FRAME_SIZE * 2);

        Log.d(
                TAG,
                "minBuffer=" + minimum +
                        " selectedBuffer=" + bufferSize
        );

        /*
         * Önce UNPROCESSED deniyoruz.
         */
        recorder = createRecorder(
                MediaRecorder.AudioSource.UNPROCESSED,
                bufferSize
        );

        if (recorder != null) {
            Log.d(
                    TAG,
                    "UNPROCESSED recorder state = " + recorder.getState()
            );
        } else {
            Log.w(TAG, "UNPROCESSED recorder creation failed");
        }

        /*
         * UNPROCESSED çalışmazsa VOICE_RECOGNITION'a geç.
         */
        if (recorder == null ||
                recorder.getState() != AudioRecord.STATE_INITIALIZED) {

            Log.w(TAG, "Falling back to VOICE_RECOGNITION");

            if (recorder != null) {
                try {
                    recorder.release();
                } catch (Exception ignored) {
                }
            }

            recorder = createRecorder(
                    MediaRecorder.AudioSource.VOICE_RECOGNITION,
                    bufferSize
            );

            if (recorder != null) {
                Log.d(
                        TAG,
                        "VOICE_RECOGNITION recorder state = "
                                + recorder.getState()
                );
            }
        }

        /*
         * İki kaynak da başarısızsa çık.
         */
        if (recorder == null ||
                recorder.getState() != AudioRecord.STATE_INITIALIZED) {

            Log.e(TAG, "AudioRecord initialization FAILED");

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

        running = true;

        try {

            Log.d(TAG, "Calling startRecording()");

            recorder.startRecording();

            Log.d(
                    TAG,
                    "AudioRecord started. recordingState="
                            + recorder.getRecordingState()
            );

        } catch (IllegalStateException error) {

            Log.e(
                    TAG,
                    "startRecording() FAILED",
                    error
            );

            running = false;

            recorder.release();
            recorder = null;

            call.reject(
                    "Audio recording could not be started"
            );

            return;
        }

        audioThread = new Thread(
                this::captureLoop,
                "DutarPitchDetector"
        );

        audioThread.start();

        Log.d(TAG, "Audio thread started");

        call.resolve();
    }

    private AudioRecord createRecorder(
            int source,
            int bufferSize
    ) {

        try {

            Log.d(
                    TAG,
                    "Creating AudioRecord source="
                            + source
                            + " buffer="
                            + bufferSize
            );

            return new AudioRecord(
                    source,
                    SAMPLE_RATE,
                    AudioFormat.CHANNEL_IN_MONO,
                    AudioFormat.ENCODING_PCM_16BIT,
                    bufferSize
            );

        } catch (IllegalArgumentException |
                 SecurityException error) {

            Log.e(
                    TAG,
                    "createRecorder() failed. source=" + source,
                    error
            );

            return null;
        }
    }

    @PluginMethod
    public void stop(PluginCall call) {

        Log.d(TAG, "stop() called");

        stopRecorder();

        call.resolve();
    }

    private void captureLoop() {

        Log.d(TAG, "captureLoop ENTER");

        Process.setThreadPriority(
                Process.THREAD_PRIORITY_AUDIO
        );

        short[] pcm = new short[FRAME_SIZE];

        int consecutiveReadErrors = 0;
        long frameCounter = 0;

        while (running && recorder != null) {

            int read;

            try {

                read = recorder.read(
                        pcm,
                        0,
                        pcm.length
                );

            } catch (IllegalStateException error) {

                Log.e(
                        TAG,
                        "AudioRecord.read() threw exception",
                        error
                );

                break;
            }

            /*
             * AudioRecord hata kodu döndürdü.
             */
            if (read < 0) {

                consecutiveReadErrors++;

                Log.w(
                        TAG,
                        "AudioRecord read error=" + read
                                + " consecutive="
                                + consecutiveReadErrors
                );

                if (read == AudioRecord.ERROR_DEAD_OBJECT) {

                    Log.e(
                            TAG,
                            "AudioRecord ERROR_DEAD_OBJECT"
                    );

                    break;
                }

                if (consecutiveReadErrors >= 20) {

                    Log.e(
                            TAG,
                            "Too many consecutive read errors"
                    );

                    break;
                }

                continue;
            }

            /*
             * Çok az sample geldiyse pitch hesaplamıyoruz.
             */
            if (read < 1024) {

                if (frameCounter % 40 == 0) {
                    Log.w(
                            TAG,
                            "Not enough samples. read=" + read
                    );
                }

                frameCounter++;

                continue;
            }

            consecutiveReadErrors = 0;

            double rms = calculateRms(
                    pcm,
                    read
            );

            double frequency =
                    rms > RMS_THRESHOLD
                            ? detectPitchYin(pcm, read)
                            : -1.0;

            /*
             * Logcat'i doldurmamak için yaklaşık
             * her 40 frame'de bir durum yazıyoruz.
             */
            if (frameCounter % 40 == 0) {

                Log.d(
                        TAG,
                        "FRAME"
                                + " count=" + frameCounter
                                + " read=" + read
                                + " rms=" + rms
                                + " threshold=" + RMS_THRESHOLD
                                + " freq=" + frequency
                );
            }

            /*
             * Pitch bulunduğunda ayrıca yaz.
             */
            if (frequency > 0) {

                Log.d(
                        TAG,
                        "PITCH FOUND: "
                                + frequency
                                + " Hz"
                                + " rms="
                                + rms
                );
            }

            JSObject payload = new JSObject();

            payload.put(
                    "frequency",
                    frequency > 0
                            ? frequency
                            : 0
            );

            payload.put(
                    "rms",
                    rms
            );

            notifyListeners(
                    "pitch",
                    payload
            );

            frameCounter++;
        }

        Log.d(
                TAG,
                "captureLoop EXIT"
                        + " running=" + running
                        + " recorderNull="
                        + (recorder == null)
        );

        if (running) {
            running = false;
        }
    }

    private double calculateRms(
            short[] data,
            int length
    ) {

        double sum = 0;

        for (int i = 0; i < length; i++) {

            double sample =
                    data[i] / 32768.0;

            sum += sample * sample;
        }

        return Math.sqrt(
                sum / length
        );
    }

    private double detectPitchYin(
            short[] data,
            int length
    ) {

        int minLag =
                SAMPLE_RATE / 1200;

        int maxLag =
                Math.min(
                        SAMPLE_RATE / 55,
                        length / 2
                );

        double[] difference =
                new double[maxLag + 1];

        for (
                int lag = minLag;
                lag <= maxLag;
                lag++
        ) {

            double sum = 0;

            for (
                    int i = 0;
                    i < length - lag;
                    i++
            ) {

                double delta =
                        (data[i] - data[i + lag])
                                / 32768.0;

                sum += delta * delta;
            }

            difference[lag] = sum;
        }

        double runningSum = 0;
        int bestLag = -1;

        for (
                int lag = minLag;
                lag <= maxLag;
                lag++
        ) {

            runningSum += difference[lag];

            double normalized =
                    runningSum == 0
                            ? 1
                            : difference[lag]
                              * lag
                              / runningSum;

            difference[lag] =
                    normalized;

            if (
                    lag > minLag + 1
                            && normalized < 0.20
                            && normalized
                            <= difference[lag - 1]
            ) {

                while (
                        lag + 1 <= maxLag
                ) {

                    double nextRaw =
                            difference[lag + 1];

                    double nextRunningSum =
                            runningSum + nextRaw;

                    double nextNormalized =
                            nextRunningSum == 0
                                    ? 1
                                    : nextRaw
                                      * (lag + 1)
                                      / nextRunningSum;

                    if (
                            nextNormalized
                                    >= difference[lag]
                    ) {
                        break;
                    }

                    lag++;

                    runningSum =
                            nextRunningSum;

                    difference[lag] =
                            nextNormalized;
                }

                bestLag = lag;

                break;
            }
        }

        if (bestLag < 0) {
            return -1;
        }

        int left =
                Math.max(
                        minLag,
                        bestLag - 1
                );

        int right =
                Math.min(
                        maxLag,
                        bestLag + 1
                );

        double s0 =
                difference[left];

        double s1 =
                difference[bestLag];

        double s2 =
                difference[right];

        double denominator =
                2 * s1 - s2 - s0;

        double refinedLag =
                denominator == 0
                        ? bestLag
                        : bestLag
                          + (s2 - s0)
                            / (2 * denominator);

        return SAMPLE_RATE
                / refinedLag;
    }

    private synchronized void stopRecorder() {

        Log.d(TAG, "stopRecorder()");

        running = false;

        if (recorder != null) {

            try {

                recorder.stop();

                Log.d(
                        TAG,
                        "AudioRecord stopped"
                );

            } catch (IllegalStateException error) {

                Log.w(
                        TAG,
                        "AudioRecord.stop() error",
                        error
                );
            }

            try {
                recorder.release();
            } catch (Exception ignored) {
            }

            recorder = null;
        }

        if (audioThread != null) {

            try {

                audioThread.join(300);

            } catch (InterruptedException ignored) {

                Thread.currentThread()
                        .interrupt();
            }

            audioThread = null;
        }

        Log.d(TAG, "Recorder completely stopped");
    }

    @Override
    protected void handleOnDestroy() {

        Log.d(TAG, "Plugin destroyed");

        stopRecorder();

        super.handleOnDestroy();
    }
}