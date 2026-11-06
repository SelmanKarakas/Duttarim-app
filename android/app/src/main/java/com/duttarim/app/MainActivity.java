package com.duttarim.app;

import android.Manifest;
import android.animation.AnimatorSet;
import android.animation.ObjectAnimator;
import android.animation.ValueAnimator;
import android.os.Build;
import android.view.animation.AccelerateInterpolator;
import android.view.animation.AccelerateDecelerateInterpolator;
import android.content.pm.ActivityInfo;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.os.SystemClock;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.PermissionRequest;
import android.webkit.WebView;

import androidx.core.content.ContextCompat;
import androidx.core.splashscreen.SplashScreen;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebChromeClient;

public class MainActivity extends BridgeActivity {

    private static final int RECORD_AUDIO_REQUEST = 1001;
    private View launchOverlay;
    private AnimatorSet launchAnimation;
    private Runnable launchReady;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        SplashScreen systemSplash = SplashScreen.installSplashScreen(this);
        systemSplash.setOnExitAnimationListener(provider -> provider.remove());
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
        BrandedSplashView overlay = new BrandedSplashView(this);
        View artwork = overlay.card;
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
                launchReady = null;
                if (Build.VERSION.SDK_INT >= 26 && !ValueAnimator.areAnimatorsEnabled()) {
                    content.removeView(overlay);
                    launchOverlay = null;
                    return;
                }
                artwork.setPivotX(artwork.getWidth() * 0.5f);
                artwork.setPivotY(artwork.getHeight() * 0.5f);
                AnimatorSet recoil = new AnimatorSet();
                recoil.playTogether(ObjectAnimator.ofFloat(artwork, View.SCALE_X, 1f, 0.92f),
                        ObjectAnimator.ofFloat(artwork, View.SCALE_Y, 1f, 0.92f));
                recoil.setDuration(180);
                recoil.setInterpolator(new AccelerateDecelerateInterpolator());
                AnimatorSet jump = new AnimatorSet();
                jump.playTogether(ObjectAnimator.ofFloat(artwork, View.SCALE_X, 0.92f, 3.4f),
                        ObjectAnimator.ofFloat(artwork, View.SCALE_Y, 0.92f, 3.4f));
                jump.setDuration(560);
                jump.setInterpolator(new AccelerateInterpolator(1.1f));
                ObjectAnimator fade = ObjectAnimator.ofFloat(artwork, View.ALPHA, 1f, 0f);
                fade.setStartDelay(200);
                fade.setDuration(360);
                AnimatorSet reveal = new AnimatorSet();
                ObjectAnimator backgroundFade = ObjectAnimator.ofFloat(overlay.background, View.ALPHA, 1f, 0f);
                backgroundFade.setStartDelay(440);
                backgroundFade.setDuration(120);
                reveal.playTogether(jump, fade, backgroundFade);
                launchAnimation = new AnimatorSet();
                launchAnimation.playSequentially(recoil, reveal);
                launchAnimation.addListener(new android.animation.AnimatorListenerAdapter() {
                    @Override public void onAnimationEnd(android.animation.Animator animation) {
                        content.removeView(overlay);
                        if (launchOverlay == overlay) launchOverlay = null;
                        launchAnimation = null;
                    }
                });
                launchAnimation.start();
            }
        };
        overlay.post(launchReady);
    }

    @Override
    public void onDestroy() {
        if (launchAnimation != null) launchAnimation.cancel();
        if (launchOverlay != null) {
            if (launchReady != null) launchOverlay.removeCallbacks(launchReady);
            launchOverlay.animate().cancel();
        }
        super.onDestroy();
    }
}
