package com.example.jarvis

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.speech.RecognizerIntent
import android.speech.tts.TextToSpeech
import android.webkit.WebView
import android.webkit.WebViewClient
import android.webkit.WebChromeClient
import android.webkit.JavascriptInterface
import android.widget.Toast
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

        webView.addJavascriptInterface(Bridge(), "Android")

        webView.loadUrl("file:///android_asset/index.html")
    }

    inner class Bridge {

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
            runOnUiThread {
                tts?.stop()
            }
        }
    }

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
                "Speak to Jarvis"
            )

            startActivityForResult(intent, REQUEST_SPEECH)

        } catch (e: Exception) {
            toast("Voice recognition unavailable")
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

        val cmd = command.trim().lowercase(Locale.ROOT)

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
                    startActivity(
                        Intent("android.media.action.IMAGE_CAPTURE")
                    )
                }

                cmd.contains("settings") -> {
                    startActivity(
                        Intent(android.provider.Settings.ACTION_SETTINGS)
                    )
                }

                cmd.startsWith("search:") -> {
                    val query = command.substringAfter(":").trim()
                    openUrl(
                        "https://www.google.com/search?q=" +
                            Uri.encode(query)
                    )
                }

                cmd.startsWith("play:") -> {
                    val query = command.substringAfter(":").trim()
                    openUrl(
                        "https://www.youtube.com/results?search_query=" +
                            Uri.encode(query)
                    )
                }

                cmd.startsWith("call:") -> {
                    val number = command.substringAfter(":").trim()

                    startActivity(
                        Intent(
                            Intent.ACTION_DIAL,
                            Uri.parse("tel:$number")
                        )
                    )
                }

                else -> {
                    toast("Unknown command: $command")
                }
            }

        } catch (e: Exception) {
            toast("Action failed")
        }
    }

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

    @Deprecated("Deprecated Android callback")
    override fun onActivityResult(
        requestCode: Int,
        resultCode: Int,
        data: Intent?
    ) {
        super.onActivityResult(
            requestCode,
            resultCode,
            data
        )

        if (requestCode == REQUEST_SPEECH &&
            resultCode == RESULT_OK
        ) {

            val results = data?.getStringArrayListExtra(
                RecognizerIntent.EXTRA_RESULTS
            )

            val text = results?.firstOrNull() ?: return

            val safeText = text
                .replace("\\", "\\\\")
                .replace("'", "\\'")
                .replace("\n", " ")

            webView.evaluateJavascript(
                "if(typeof onVoiceResult === 'function') " +
                    "onVoiceResult('$safeText');",
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

    override fun onInit(status: Int) {

        if (status == TextToSpeech.SUCCESS) {
            tts?.language = Locale("en", "IN")
        }
    }

    override fun onDestroy() {
        tts?.stop()
        tts?.shutdown()
        webView.destroy()
        super.onDestroy()
    }
} 

  

            
