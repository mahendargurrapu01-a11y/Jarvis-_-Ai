package com.example.jarvis

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.provider.MediaStore
import android.speech.RecognizerIntent
import android.speech.tts.TextToSpeech
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import java.util.Locale

class MainActivity : Activity() {

    private lateinit var webView: WebView
    private var tts: TextToSpeech? = null

    private val speechRequest = 100
    private val permissionRequest = 101

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        tts = TextToSpeech(this) {
            tts?.language = Locale("en", "IN")
        }

        webView = WebView(this)

        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        webView.settings.allowFileAccess = true

        webView.addJavascriptInterface(
            JarvisBridge(),
            "Android"
        )

        webView.webViewClient = WebViewClient()

        setContentView(webView)

        webView.loadUrl("file:///android_asset/index.html")
    }

    inner class JarvisBridge {

        @JavascriptInterface
        fun speak(message: String) {
            runOnUiThread {
                tts?.speak(
                    message,
                    TextToSpeech.QUEUE_FLUSH,
                    null,
                    "jarvis"
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
        fun action(command: String) {
            runOnUiThread {
                executeCommand(command)
            }
        }
    }

    private fun startListening() {

        if (checkSelfPermission(Manifest.permission.RECORD_AUDIO)
            != PackageManager.PERMISSION_GRANTED
        ) {
            requestPermissions(
                arrayOf(Manifest.permission.RECORD_AUDIO),
                permissionRequest
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

            startActivityForResult(intent, speechRequest)

        } catch (e: Exception) {
            showMessage("Voice recognition unavailable")
        }
    }

    private fun executeCommand(command: String) {

        try {

            when {

                command == "whatsapp" ->
                    openApp("com.whatsapp")

                command == "youtube" ->
                    openApp("com.google.android.youtube")

                command == "google" ->
                    openApp("com.google.android.googlequicksearchbox")

                command == "camera" -> {
                    startActivity(
                        Intent(MediaStore.ACTION_IMAGE_CAPTURE)
                    )
                }

                command == "settings" -> {
                    startActivity(
                        Intent(android.provider.Settings.ACTION_SETTINGS)
                    )
                }

                command.startsWith("search:") -> {
                    val query = command.removePrefix("search:")
                    val url = "https://www.google.com/search?q=" +
                            Uri.encode(query)

                    startActivity(
                        Intent(Intent.ACTION_VIEW, Uri.parse(url))
                    )
                }

                command.startsWith("play:") -> {
                    val query = command.removePrefix("play:")

                    val url = "https://www.youtube.com/results?search_query=" +
                            Uri.encode(query)

                    startActivity(
                        Intent(Intent.ACTION_VIEW, Uri.parse(url))
                    )
                }

                command.startsWith("call:") -> {
                    val number = command.removePrefix("call:")

                    startActivity(
                        Intent(
                            Intent.ACTION_DIAL,
                            Uri.parse("tel:$number")
                        )
                    )
                }

                else -> showMessage("Command not supported")
            }

        } catch (e: Exception) {
            showMessage("Unable to perform this action")
        }
    }

    private fun openApp(packageName: String) {

        val launchIntent =
            packageManager.getLaunchIntentForPackage(packageName)

        if (launchIntent != null) {
            startActivity(launchIntent)
        } else {
            showMessage("App is not installed")
        }
    }

    private fun showMessage(message: String) {
        Toast.makeText(
            this,
            message,
            Toast.LENGTH_SHORT
        ).show()
    }

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

        if (requestCode == permissionRequest &&
            grantResults.isNotEmpty() &&
            grantResults[0] == PackageManager.PERMISSION_GRANTED
        ) {
            startListening()
        }
    }

    override fun onActivityResult(
        requestCode: Int,
        resultCode: Int,
        data: Intent?
    ) {
        super.onActivityResult(requestCode, resultCode, data)

        if (requestCode == speechRequest &&
            resultCode == RESULT_OK
        ) {

            val results = data?.getStringArrayListExtra(
                RecognizerIntent.EXTRA_RESULTS
            )

            val spokenText = results?.firstOrNull()

            if (spokenText != null) {

                val safeText = org.json.JSONObject.quote(spokenText)

                webView.evaluateJavascript(
                    "onVoiceResult($safeText)",
                    null
                )
            }
        }
    }

    @Deprecated("Deprecated by Android")
    override fun onBackPressed() {
        if (::webView.isInitialized && webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }

    override fun onDestroy() {
        tts?.stop()
        tts?.shutdown()
        webView.destroy()
        super.onDestroy()
    }
}
