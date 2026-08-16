package com.duttarim.app;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebView;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private static final int RECORD_AUDIO_REQUEST = 1001;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(DutarTunerPlugin.class);
        super.onCreate(savedInstanceState);

        WebView webView = getBridge().getWebView();
        webView.setWebChromeClient(new WebChromeClient() {
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
}