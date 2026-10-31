package com.salblox.app;

import android.content.Context;
import android.webkit.JavascriptInterface;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

/**
 * window.SalBloxNative for the web page. Same role as the iOS app's Roblox.swift:
 * the phone makes the Roblox requests, so the browser's CORS rule does not apply.
 * JavascriptInterface methods run on a background thread, so these calls may block.
 */
public class NativeBridge {
    private static final String USER_AGENT = "SalBlox/1.0 (Android)";

    private final Context ctx;

    NativeBridge(Context ctx) {
        this.ctx = ctx;
    }

    @JavascriptInterface
    public boolean isLoggedIn() {
        return Session.isLoggedIn(ctx);
    }

    /** GET a Roblox URL. Returns the response body, or null on any failure. */
    @JavascriptInterface
    public String get(String url) {
        return request("GET", url, null);
    }

    /** POST a JSON body to a Roblox URL (handles the x-csrf-token retry like the Swift app). */
    @JavascriptInterface
    public String post(String url, String json) {
        return request("POST", url, json);
    }

    private String request(String method, String url, String body) {
        try {
            if (!isRobloxUrl(url)) return null;
            String token = null;
            for (int attempt = 0; attempt < 2; attempt++) {
                HttpURLConnection c = open(method, url, body, token);
                try {
                    int code = c.getResponseCode();
                    String csrf = c.getHeaderField("x-csrf-token");
                    if (code == 403 && csrf != null && token == null) {
                        token = csrf;
                        continue;
                    }
                    if (code < 200 || code >= 300) return null;
                    return read(c.getInputStream());
                } finally {
                    c.disconnect();
                }
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    private HttpURLConnection open(String method, String url, String body, String token) throws IOException {
        HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
        c.setRequestMethod(method);
        c.setConnectTimeout(15000);
        c.setReadTimeout(20000);
        c.setRequestProperty("User-Agent", USER_AGENT);
        c.setRequestProperty("Accept", "application/json");
        if (token != null) {
            c.setRequestProperty("x-csrf-token", token);
        }
        if (body != null) {
            c.setDoOutput(true);
            c.setRequestProperty("Content-Type", "application/json;charset=utf-8");
            try (OutputStream out = c.getOutputStream()) {
                out.write(body.getBytes(StandardCharsets.UTF_8));
            }
        }
        return c;
    }

    /** Only https requests to roblox.com and its subdomains. The login cookie never goes anywhere else. */
    static boolean isRobloxUrl(String url) {
        try {
            URL u = new URL(url);
            String host = u.getHost();
            return "https".equals(u.getProtocol())
                    && (host.equals("roblox.com") || host.endsWith(".roblox.com"));
        } catch (Exception e) {
            return false;
        }
    }

    private static String read(InputStream in) throws IOException {
        try (InputStream input = in) {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            byte[] buf = new byte[8192];
            int n;
            while ((n = input.read(buf)) != -1) {
                out.write(buf, 0, n);
            }
            return new String(out.toByteArray(), StandardCharsets.UTF_8);
        }
    }
}
