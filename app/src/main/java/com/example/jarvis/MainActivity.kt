 

  package com.example.jarvis

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.speech.RecognizerIntent
import android.speech.tts.TextToSpeech
import android.webkit.WebView
import android.webkit.WebViewClient
import android.webkit.WebChromeClient
import android.webkit.JavascriptInterface
import android.widget.Toast
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import java.util.Locale

class MainActivity : Activity(), TextToSpeech.OnInitListener {

    private lateinit var webView: WebView
    private var tts: TextToSpeech? = null

    private val REQUEST_MIC = 101
    private val REQUEST_SPEECH = 102

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        tts = TextToSpeech(this, this)

        webView = WebView(this)
        setContentView(webView)

        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true

        webView.webViewClient = WebViewClient()
        webView.webChromeClient = WebChromeClient()

        webView.addJavascriptInterface(JarvisBridge(), "Android")

        webView.loadUrl("file:///android_asset/index.html")
    }

    inner class JarvisBridge {

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
        fun speak(text: String) {
            runOnUiThread {
                speakText(text)
            }
        }

        @JavascriptInterface
        fun action(command: String) {
            runOnUiThread {
                executeCommand(command)
            }
        }

        @JavascriptInterface
        fun execute(command: String) {
            runOnUiThread {
                executeCommand(command)
            }
        }

        @JavascriptInterface
        fun stopSpeaking() {
            tts?.stop()
        }
    }

    private fun startListening() {

        if (ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.RECORD_AUDIO
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            ActivityCompat.requestPermissions(
                this,
                arrayOf(Manifest.permission.RECORD_AUDIO),
                REQUEST_MIC
            )
            return
        }

        try {
            val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH)

            intent.putExtra(
                RecognizerIntent.EXTRA_LANGUAGE_MODEL,
                RecognizerIntent.LANGUAGE_MODEL_FREE_FORM
            )

            intent.putExtra(
                RecognizerIntent.EXTRA_LANGUAGE,
                Locale.getDefault()
            )

            intent.putExtra(
                RecognizerIntent.EXTRA_PROMPT,
                "Speak to Jarvis"
            )

            startActivityForResult(intent, REQUEST_SPEECH)

        } catch (e: Exception) {
            Toast.makeText(
                this,
                "Voice recognition unavailable",
                Toast.LENGTH_LONG
            ).show()
        }
    }

    private fun speakText(text: String) {
        tts?.speak(
            text,
            TextToSpeech.QUEUE_FLUSH,
            null,
            "JARVIS"
        )
    }

    private fun executeCommand(command: String) {

        val cmd = command.lowercase(Locale.getDefault())

        try {
            when {

                cmd.contains("youtube") -> {
                    openUrl("https://www.youtube.com")
                }

                cmd.contains("instagram") -> {
                    openUrl("https://www.instagram.com")
                }

                cmd.contains("google") -> {
                    openUrl("https://www.google.com")
                }

                cmd.contains("camera") -> {
                    val intent = Intent("android.media.action.IMAGE_CAPTURE")
                    startActivity(intent)
                }

                cmd.contains("settings") -> {
                    startActivity(
                        Intent(android.provider.Settings.ACTION_SETTINGS)
                    )
                }

                cmd.startsWith("search:") -> {
                    val query = command.substringAfter("search:")
                    openUrl("https://www.google.com/search?q=${query.replace(" ", "+")}")
                }

                cmd.startsWith("play:") -> {
                    val query = command.substringAfter("play:")
                    openUrl("https://www.youtube.com/results?search_query=${query.replace(" ", "+")}")
                }

                cmd.startsWith("call:") -> {
                    val number = command.substringAfter("call:").trim()

                    val intent = Intent(
                        Intent.ACTION_DIAL,
                        android.net.Uri.parse("tel:$number")
                    )

                    startActivity(intent)
                }

                else -> {
                    Toast.makeText(
                        this,
                        "Command: $command",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }

        } catch (e: Exception) {
            Toast.makeText(
                this,
                "Action failed",
                Toast.LENGTH_SHORT
            ).show()
        }
    }

    private fun openUrl(url: String) {
        val intent = Intent(Intent.ACTION_VIEW, android.net.Uri.parse(url))
        startActivity(intent)
    }

    override fun onActivityResult(
        requestCode: Int,
        resultCode: Int,
        data: Intent?
    ) {
        super.onActivityResult(requestCode, resultCode, data)

        if (requestCode == REQUEST_SPEECH &&
            resultCode == RESULT_OK &&
            data != null
        ) {
            val results = data.getStringArrayListExtra(
                RecognizerIntent.EXTRA_RESULTS
            )

            val text = results?.firstOrNull() ?: ""

            val safeText = text
                .replace("\\", "\\\\")
                .replace("'", "\\'")
                .replace("\n", " ")

            webView.evaluateJavascript(
                "onVoiceResult('$safeText')",
                null
            )
        }
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

        if (requestCode == REQUEST_MIC &&
            grantResults.isNotEmpty() &&
            grantResults[0] == PackageManager.PERMISSION_GRANTED
        ) {
            startListening()
        } else {
            Toast.makeText(
                this,
                "Microphone permission denied",
                Toast.LENGTH_SHORT
            ).show()
        }
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            tts?.language = Locale.getDefault()
        }
    }

    override fun onDestroy() {
        tts?.stop()
        tts?.shutdown()
        webView.destroy()
        super.onDestroy()
    }
}