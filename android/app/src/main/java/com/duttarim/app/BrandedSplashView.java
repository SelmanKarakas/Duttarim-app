package com.duttarim.app;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Outline;
import android.view.View;
import android.view.ViewOutlineProvider;
import android.widget.FrameLayout;
import android.widget.ImageView;

/** Stationary patterned background and an independently animated card. */
final class BrandedSplashView extends FrameLayout {
    final ImageView background;
    final ImageView card;
    private final int sourceWidth;
    private final int sourceHeight;
    private final int cardX, cardY, cardWidth, cardHeight;

    BrandedSplashView(Context context) {
        super(context);
        Bitmap source = BitmapFactory.decodeResource(getResources(), R.drawable.branded_splash);
        sourceWidth = source.getWidth();
        sourceHeight = source.getHeight();
        // Card bounds in the approved 884 x 1780 splash master (excluding its shadow).
        cardX = Math.round(sourceWidth * 278f / 884f);
        cardY = Math.round(sourceHeight * 624f / 1780f);
        cardWidth = Math.round(sourceWidth * 328f / 884f);
        cardHeight = Math.round(sourceHeight * 335f / 1780f);
        background = new ImageView(context);
        background.setImageResource(R.drawable.splash_background);
        background.setScaleType(ImageView.ScaleType.CENTER_CROP);
        addView(background);
        card = new ImageView(context);
        card.setImageBitmap(Bitmap.createBitmap(source, cardX, cardY, cardWidth, cardHeight));
        card.setScaleType(ImageView.ScaleType.FIT_XY);
        card.setOutlineProvider(new ViewOutlineProvider() {
            @Override public void getOutline(View view, Outline outline) {
                outline.setRoundRect(0, 0, view.getWidth(), view.getHeight(), view.getWidth() * 0.20f);
            }
        });
        card.setClipToOutline(true);
        card.setElevation(5f * getResources().getDisplayMetrics().density);
        addView(card);
        setImportantForAccessibility(View.IMPORTANT_FOR_ACCESSIBILITY_NO_HIDE_DESCENDANTS);
    }

    @Override protected void onLayout(boolean changed, int left, int top, int right, int bottom) {
        int width = right - left, height = bottom - top;
        background.layout(0, 0, width, height);
        float scale = Math.max((float) width / sourceWidth, (float) height / sourceHeight);
        float dx = (width - sourceWidth * scale) / 2f;
        float dy = (height - sourceHeight * scale) / 2f;
        int x = Math.round(dx + cardX * scale), y = Math.round(dy + cardY * scale);
        card.layout(x, y, x + Math.round(cardWidth * scale), y + Math.round(cardHeight * scale));
    }
}
