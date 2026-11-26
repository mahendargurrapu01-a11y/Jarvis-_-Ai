package com.example.jarvis

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.provider.MediaStore
import android.speech.RecognizerIntent
import android.speech.tts.TextToSpeech
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import org.json.JSONObject
import java.util.Locale

class MainActivity : Activity(), TextToSpeech.OnInitListener {

    private lateinit var webView: WebView
    private var tts: TextToSpeech? = null

    companion object {
        private const val REQUEST_MIC = 101
        private const val REQUEST_SPEECH = 102
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        tts = TextToSpeech(this, this)

        webView = WebView(this)

        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true

        webView.webViewClient = WebViewClient()
        webView.webChromeClient = WebChromeClient()

        webView.addJavascriptInterface(JarvisBridge(), "Android")

        setContentView(webView)

        webView.loadUrl("file:///android_asset/index.html")
    }

    // JARVIS JavaScript connection
    inner class JarvisBridge {

        @JavascriptInterface
        fun speak(text: String) {
            runOnUiThread {
                tts?.speak(
                    text,
                    TextToSpeech.QUEUE_FLUSH,
                    null,
                    "JARVIS"
                )
            }
        }

        @JavascriptInterface
        fun stopSpeaking() {
            runOnUiThread {
                tts?.stop()
            }
        }

        @JavascriptInterface
        fun listen() {
            runOnUiThread {
                startListening()
            }
        }

        @JavascriptInterface
        fun startVoice() {
            runOnUiThread {
                startListening()
            }
        }

        @JavascriptInterface
        fun sendCommand(command: String) {
            runOnUiThread {
                this@MainActivity.sendCommand(command)
            }
        }

        @JavascriptInterface
        fun action(command: String) {
            runOnUiThread {
                this@MainActivity.sendCommand(command)
            }
        }

        @JavascriptInterface
        fun execute(command: String) {
            runOnUiThread {
                this@MainActivity.sendCommand(command)
            }
        }
    }

    // Voice recognition
    private fun startListening() {

        if (checkSelfPermission(Manifest.permission.RECORD_AUDIO)
            != PackageManager.PERMISSION_GRANTED
        ) {
            requestPermissions(
                arrayOf(Manifest.permission.RECORD_AUDIO),
                REQUEST_MIC
            )
            return
        }

        try {
            val intent = Intent(
                RecognizerIntent.ACTION_RECOGNIZE_SPEECH
            )

            intent.putExtra(
                RecognizerIntent.EXTRA_LANGUAGE_MODEL,
                RecognizerIntent.LANGUAGE_MODEL_FREE_FORM
            )

            intent.putExtra(
                RecognizerIntent.EXTRA_LANGUAGE,
                "en-IN"
            )

            intent.putExtra(
                RecognizerIntent.EXTRA_PROMPT,
                "Speak to JARVIS"
            )

            startActivityForResult(intent, REQUEST_SPEECH)

        } catch (e: Exception) {
            toast("Speech recognition unavailable")
        }
    }

    // Process commands
    private fun sendCommand(command: String) {

        val cmd = command.trim()
        val lower = cmd.lowercase(Locale.ROOT)

        if (cmd.isEmpty()) return

        try {
            when {

                lower.startsWith("youtube:") -> {
                    val query = cmd.substringAfter(":").trim()

                    if (query.isEmpty()) {
                        launchInstalledApp("YouTube")
                    } else {
                        openUrl(
                            "https://www.youtube.com/results?search_query=" +
                                Uri.encode(query)
                        )
                    }
                }

                lower.startsWith("google:") -> {
                    val query = cmd.substringAfter(":").trim()

                    if (query.isEmpty()) {
                        openUrl("https://www.google.com")
                    } else {
                        openUrl(
                            "https://www.google.com/search?q=" +
                                Uri.encode(query)
                        )
                    }
                }

                lower.startsWith("play:") -> {
                    val query = cmd.substringAfter(":").trim()

                    openUrl(
                        "https://www.youtube.com/results?search_query=" +
                            Uri.encode(query)
                    )
                }

                lower.startsWith("search:") -> {
                    val query = cmd.substringAfter(":").trim()

                    openUrl(
                        "https://www.google.com/search?q=" +
                            Uri.encode(query)
                    )
                }

                lower.startsWith("call:") -> {
                    val number = cmd.substringAfter(":").trim()

                    startActivity(
                        Intent(
                            Intent.ACTION_DIAL,
                            Uri.parse("tel:$number")
                        )
                    )
                }

                lower.startsWith("app:") -> {
                    val appName = cmd.substringAfter(":").trim()
                    launchInstalledApp(appName)
                }

                lower.startsWith("open:") -> {
                    val appName = cmd.substringAfter(":").trim()

                    when (appName.lowercase(Locale.ROOT)) {

                        "camera" -> {
                            startActivity(
                                Intent(MediaStore.ACTION_IMAGE_CAPTURE)
                            )
                        }

                        "settings" -> {
                            startActivity(
                                Intent(
                                    android.provider.Settings.ACTION_SETTINGS
                                )
                            )
                        }

                        else -> {
                            launchInstalledApp(appName)
                        }
                    }
                }

                else -> {
                    toast("Unknown command: $command")
                }
            }

        } catch (e: Exception) {
            toast("Could not complete action")
        }
    }

    // Find and open installed applications
    private fun launchInstalledApp(appName: String) {

        try {
            val searchName = appName.trim().lowercase(Locale.ROOT)

            if (searchName.isEmpty()) return

            val launcherIntent = Intent(Intent.ACTION_MAIN).apply {
                addCategory(Intent.CATEGORY_LAUNCHER)
            }

            val installedApps = packageManager.queryIntentActivities(
                launcherIntent,
                0
            )

            val matchingApps = installedApps.mapNotNull { info ->

                val label = info.loadLabel(packageManager).toString()

                Triple(
                    label,
                    info.activityInfo.packageName,
                    info.activityInfo.name
                )
            }

            val selectedApp = matchingApps.firstOrNull {
                it.first.lowercase(Locale.ROOT) == searchName
            } ?: matchingApps.firstOrNull {
                it.first.lowercase(Locale.ROOT).startsWith(searchName)
            } ?: matchingApps.firstOrNull {
                it.first.lowercase(Locale.ROOT).contains(searchName)
            }

            if (selectedApp == null) {
                toast("$appName is not installed")
                return
            }

            val launchIntent =
                packageManager.getLaunchIntentForPackage(selectedApp.second)

            if (launchIntent != null) {
                startActivity(launchIntent)
            } else {
                toast("Cannot open $appName")
            }

        } catch (e: Exception) {
            toast("App opening failed")
        }
    }

    // Open websites
    private fun openUrl(url: String) {
        startActivity(
            Intent(Intent.ACTION_VIEW, Uri.parse(url))
        )
    }

    private fun toast(message: String) {
        Toast.makeText(
            this,
            message,
            Toast.LENGTH_SHORT
        ).show()
    }

    // Receive voice commands
    @Deprecated("Deprecated Android callback")
    override fun onActivityResult(
        requestCode: Int,
        resultCode: Int,
        data: Intent?
    ) {
        super.onActivityResult(requestCode, resultCode, data)

        if (requestCode == REQUEST_SPEECH &&
            resultCode == RESULT_OK
        ) {

            val results = data?.getStringArrayListExtra(
                RecognizerIntent.EXTRA_RESULTS
            )

            val spokenText = results?.firstOrNull() ?: return

            val safeText = JSONObject.quote(spokenText)

            webView.evaluateJavascript(
                "if(typeof onVoiceResult === 'function') onVoiceResult($safeText);",
                null
            )
        }
    }

    // Microphone permission
    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(
            requestCode,
            permissions,
            grantResults
        )

        if (requestCode == REQUEST_MIC) {

            if (grantResults.isNotEmpty() &&
                grantResults[0] == PackageManager.PERMISSION_GRANTED
            ) {
                startListening()
            } else {
                toast("Microphone permission denied")
            }
        }
    }

    // JARVIS voice configuration
    override fun onInit(status: Int) {

        if (status == TextToSpeech.SUCCESS) {

            tts?.let { engine ->

                val result = engine.setLanguage(
                    Locale("en", "IN")
                )

                if (result >= TextToSpeech.LANG_AVAILABLE) {

                    // Lower-pitched JARVIS voice
                    engine.setSpeechRate(0.90f)
                    engine.setPitch(0.85f)
                }
            }
        }
    }

    override fun onDestroy() {

        tts?.stop()
        tts?.shutdown()

        if (::webView.isInitialized) {
            webView.destroy()
        }

        super.onDestroy()
    }
}
