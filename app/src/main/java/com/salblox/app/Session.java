package com.salblox.app;

import android.content.Context;
import android.content.SharedPreferences;

/** Stores the Roblox login cookie on this phone only (app-private storage). */
public final class Session {
    private static final String PREFS = "salblox";
    private static final String KEY_COOKIE = "cookie";
    private static final String KEY_SKIPPED = "skipped";

    private Session() {}

    private static SharedPreferences prefs(Context c) {
        return c.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    public static void saveCookie(Context c, String value) {
        prefs(c).edit().putString(KEY_COOKIE, value).putBoolean(KEY_SKIPPED, false).apply();
    }

    public static String cookie(Context c) {
        return prefs(c).getString(KEY_COOKIE, null);
    }

    public static boolean isLoggedIn(Context c) {
        return cookie(c) != null;
    }

    public static void logout(Context c) {
        prefs(c).edit().remove(KEY_COOKIE).apply();
    }

    public static boolean skipped(Context c) {
        return prefs(c).getBoolean(KEY_SKIPPED, false);
    }

    public static void setSkipped(Context c) {
        prefs(c).edit().putBoolean(KEY_SKIPPED, true).apply();
    }
}
