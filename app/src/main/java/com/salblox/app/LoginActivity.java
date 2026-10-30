package com.salblox.app;

import android.app.Activity;
import android.os.Bundle;
import android.view.ViewGroup;
import android.webkit.CookieManager;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.LinearLayout;

/** Shows the real Roblox login page. When the .ROBLOSECURITY cookie appears, it is saved and this closes. */
public class LoginActivity extends Activity {
    private static final String LOGIN_URL = "https://www.roblox.com/login";
    private static final String COOKIE_URL = "https://www.roblox.com";
    private static final String COOKIE_NAME = ".ROBLOSECURITY=";

    private WebView web;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);

        Button skip = new Button(this);
        skip.setText("Skip");
        skip.setOnClickListener(v -> {
            Session.setSkipped(this);
            setResult(RESULT_CANCELED);
            finish();
        });
        root.addView(skip, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));

        web = new WebView(this);
        web.getSettings().setJavaScriptEnabled(true);
        web.getSettings().setDomStorageEnabled(true);
        CookieManager.getInstance().setAcceptCookie(true);
        web.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                checkForCookie();
            }
        });
        root.addView(web, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f));

        setContentView(root);
        web.loadUrl(LOGIN_URL);
    }

    private void checkForCookie() {
        String cookies = CookieManager.getInstance().getCookie(COOKIE_URL);
        if (cookies == null) return;
        for (String part : cookies.split(";")) {
            String item = part.trim();
            if (item.startsWith(COOKIE_NAME)) {
                String value = item.substring(COOKIE_NAME.length());
                if (!value.isEmpty()) {
                    Session.saveCookie(this, value);
                    setResult(RESULT_OK);
                    finish();
                }
                return;
            }
        }
    }

    @Override
    public void onBackPressed() {
        if (web != null && web.canGoBack()) {
            web.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
