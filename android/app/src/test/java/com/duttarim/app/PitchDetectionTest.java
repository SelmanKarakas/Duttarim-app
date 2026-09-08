package com.duttarim.app;

import org.junit.Test;
import java.lang.reflect.Method;
import java.lang.reflect.Field;
import static org.junit.Assert.*;

public class PitchDetectionTest {
    @Test public void detectsOpenStringsAndDetuning() throws Exception {
        DutarTunerPlugin plugin = new DutarTunerPlugin();
        Method detect = DutarTunerPlugin.class.getDeclaredMethod("detectPitchYin", short[].class, int.class);
        detect.setAccessible(true);
        for (double hz : new double[]{146.83, 196.0, 220.0, 142.65, 151.13, 285.3, 440.0}) {
            short[] samples = new short[4096];
            for (int i = 0; i < samples.length; i++)
                samples[i] = (short)(12000 * Math.sin(2 * Math.PI * hz * i / 44100));
            Object result = detect.invoke(plugin, samples, samples.length);
            assertNotNull("No detection for " + hz, result);
            Field frequency = result.getClass().getDeclaredField("frequency");
            frequency.setAccessible(true);
            double measured = frequency.getDouble(result);
            double cents = 1200 * Math.log(measured / hz) / Math.log(2);
            assertTrue(hz + " Hz: " + cents + " cents error", Math.abs(cents) < 5);
        }
    }
}
