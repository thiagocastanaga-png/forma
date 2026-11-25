package com.formargentina.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.view.View;
import android.widget.RemoteViews;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Locale;
import org.json.JSONArray;
import org.json.JSONObject;

/** Widget de Forma: lo que estás haciendo ahora, lo que sigue y tu paso del objetivo. */
public class FormaWidgetProvider extends AppWidgetProvider {
    static final String PREFS = "forma_widget";
    static final String ACTION_TICK = "com.formargentina.app.WIDGET_TICK";

    @Override
    public void onUpdate(Context ctx, AppWidgetManager mgr, int[] ids) { render(ctx, mgr, ids); }

    @Override
    public void onReceive(Context ctx, Intent intent) {
        super.onReceive(ctx, intent);
        String a = intent.getAction();
        if (ACTION_TICK.equals(a) || Intent.ACTION_TIME_CHANGED.equals(a) || Intent.ACTION_TIMEZONE_CHANGED.equals(a) || Intent.ACTION_DATE_CHANGED.equals(a)) updateAll(ctx);
    }

    static void updateAll(Context ctx) {
        AppWidgetManager mgr = AppWidgetManager.getInstance(ctx);
        int[] ids = mgr.getAppWidgetIds(new ComponentName(ctx, FormaWidgetProvider.class));
        if (ids != null && ids.length > 0) render(ctx, mgr, ids);
    }

    static String hm(int m) { m = ((m % 1440) + 1440) % 1440; return String.format(Locale.US, "%02d:%02d", m / 60, m % 60); }

    static void render(Context ctx, AppWidgetManager mgr, int[] ids) {
        String raw = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString("data", "");
        Calendar now = Calendar.getInstance();
        int nowM = now.get(Calendar.HOUR_OF_DAY) * 60 + now.get(Calendar.MINUTE);
        String today = new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(now.getTime());
        String title = "Abrí Forma", time = "", next = "Armá tu día para verlo acá", step = "", streak = "";
        int color = Color.parseColor("#86A892");
        long nextTick = now.getTimeInMillis() + 30 * 60000L;
        boolean stepDone = false;
        try {
            if (raw != null && raw.length() > 2) {
                JSONObject d = new JSONObject(raw);
                int off = 0;
                if (!today.equals(d.optString("day"))) {
                    Calendar dd = Calendar.getInstance();
                    dd.setTime(new SimpleDateFormat("yyyy-MM-dd", Locale.US).parse(d.optString("day")));
                    long diff = (now.getTimeInMillis() - dd.getTimeInMillis()) / 86400000L;
                    off = (int) diff * 1440;
                }
                int t = nowM + off;
                JSONArray bl = d.optJSONArray("blocks");
                JSONObject cur = null, nx = null;
                if (bl != null) {
                    for (int i = 0; i < bl.length(); i++) {
                        JSONObject b = bl.getJSONObject(i);
                        int s = b.getInt("s"), e = b.getInt("e");
                        if (s <= t && t < e && cur == null) cur = b;
                        else if (s > t && nx == null && !"free".equals(b.optString("k"))) nx = b;
                    }
                }
                if (cur != null) {
                    title = cur.optString("l");
                    time = "Ahora · " + hm(cur.getInt("s")) + " a " + hm(cur.getInt("e"));
                    try { color = Color.parseColor(cur.optString("c", "#86A892")); } catch (Exception ignored) {}
                    nextTick = Math.min(nextTick, now.getTimeInMillis() + (cur.getInt("e") - t) * 60000L + 5000L);
                } else if (nx != null) {
                    title = "Tiempo libre";
                    time = "Ahora";
                }
                if (nx != null) {
                    next = "Sigue " + hm(nx.getInt("s")) + " · " + nx.optString("l");
                    nextTick = Math.min(nextTick, now.getTimeInMillis() + (nx.getInt("s") - t) * 60000L + 5000L);
                } else if (cur != null) next = "Último momento del día";
                JSONObject st = d.optJSONObject("step");
                if (st != null) {
                    stepDone = st.optBoolean("done");
                    step = stepDone ? "✅ Paso de hoy hecho · " + st.optString("g") : (st.optBoolean("lock") ? "🏅 Nivel 1 completo · " + st.optString("g") : st.optString("e") + " Tu paso: " + st.optString("t"));
                }
                int sk = d.optInt("streak", 0);
                streak = sk > 0 ? "🔥 " + sk : "";
            }
        } catch (Exception ignored) {}

        Intent open = new Intent(ctx, MainActivity.class);
        open.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pi = PendingIntent.getActivity(ctx, 0, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        for (int id : ids) {
            RemoteViews v = new RemoteViews(ctx.getPackageName(), R.layout.forma_widget);
            v.setTextViewText(R.id.w_time, time);
            v.setTextViewText(R.id.w_title, title);
            v.setTextViewText(R.id.w_next, next);
            v.setTextViewText(R.id.w_streak, streak);
            v.setViewVisibility(R.id.w_streak, streak.isEmpty() ? View.GONE : View.VISIBLE);
            v.setTextViewText(R.id.w_step, step);
            v.setViewVisibility(R.id.w_step, step.isEmpty() ? View.GONE : View.VISIBLE);
            v.setInt(R.id.w_bar, "setBackgroundColor", color);
            v.setOnClickPendingIntent(R.id.w_root, pi);
            mgr.updateAppWidget(id, v);
        }
        // Próxima actualización: cuando cambia el momento del día (inexacta, cuida la batería)
        try {
            AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
            Intent tick = new Intent(ctx, FormaWidgetProvider.class).setAction(ACTION_TICK);
            PendingIntent tp = PendingIntent.getBroadcast(ctx, 1, tick, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            long at = Math.max(now.getTimeInMillis() + 60000L, nextTick);
            am.setAndAllowWhileIdle(AlarmManager.RTC, at, tp);
        } catch (Exception ignored) {}
    }
}
