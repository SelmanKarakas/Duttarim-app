package com.duttarim.app;

import android.Manifest;
import android.content.pm.ActivityInfo;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.os.SystemClock;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.webkit.PermissionRequest;
import android.webkit.WebView;

import androidx.core.content.ContextCompat;
import androidx.core.splashscreen.SplashScreen;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebChromeClient;

public class MainActivity extends BridgeActivity {

    private static final int RECORD_AUDIO_REQUEST = 1001;
    private ImageView launchOverlay;
    private Runnable launchReady;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        SplashScreen.installSplashScreen(this);
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
        registerPlugin(DutarTunerPlugin.class);
        super.onCreate(savedInstanceState);

        WebView webView = getBridge().getWebView();
        if (savedInstanceState == null) showBrandedLaunch(webView);
        webView.setWebChromeClient(new BridgeWebChromeClient(getBridge()) {
            @Override
            public void onPermissionRequest(PermissionRequest request) {
                runOnUiThread(() -> {
                    boolean wantsMicrophone = false;
                    for (String resource : request.getResources()) {
                        if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(resource)) {
                            wantsMicrophone = true;
                            break;
                        }
                    }

                    if (wantsMicrophone
                            && ContextCompat.checkSelfPermission(
                            MainActivity.this,
                            Manifest.permission.RECORD_AUDIO
                    ) == PackageManager.PERMISSION_GRANTED) {
                        request.grant(new String[]{PermissionRequest.RESOURCE_AUDIO_CAPTURE});
                    } else {
                        request.deny();
                    }
                });
            }
        });
    }

    private void showBrandedLaunch(WebView webView) {
        ViewGroup content = findViewById(android.R.id.content);
        ImageView overlay = new ImageView(this);
        overlay.setImageResource(R.drawable.branded_splash);
        overlay.setScaleType(ImageView.ScaleType.CENTER_CROP);
        overlay.setClickable(true);
        overlay.setImportantForAccessibility(View.IMPORTANT_FOR_ACCESSIBILITY_NO);
        content.addView(overlay, new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        launchOverlay = overlay;
        long started = SystemClock.uptimeMillis();
        launchReady = new Runnable() {
            @Override public void run() {
                long elapsed = SystemClock.uptimeMillis() - started;
                if (elapsed < 5000 && (elapsed < 600 || webView.getProgress() < 100)) {
                    overlay.postDelayed(this, 100);
                    return;
                }
                overlay.animate().alpha(0f).setDuration(180).withEndAction(() -> {
                    content.removeView(overlay);
                    if (launchOverlay == overlay) launchOverlay = null;
                    launchReady = null;
                }).start();
            }
        };
        overlay.post(launchReady);
    }

    @Override
    public void onDestroy() {
        if (launchOverlay != null) {
            if (launchReady != null) launchOverlay.removeCallbacks(launchReady);
            launchOverlay.animate().cancel();
        }
        super.onDestroy();
    }
}
