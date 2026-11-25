package com.formargentina.app;

import android.content.Context;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** Recibe desde la app web los datos del día y actualiza el widget de la pantalla de inicio. */
@CapacitorPlugin(name = "FormaWidget")
public class FormaWidgetPlugin extends Plugin {
    @PluginMethod
    public void update(PluginCall call) {
        String data = call.getString("data", "");
        Context ctx = getContext();
        ctx.getSharedPreferences(FormaWidgetProvider.PREFS, Context.MODE_PRIVATE).edit().putString("data", data).apply();
        FormaWidgetProvider.updateAll(ctx);
        call.resolve(new JSObject());
    }
}
