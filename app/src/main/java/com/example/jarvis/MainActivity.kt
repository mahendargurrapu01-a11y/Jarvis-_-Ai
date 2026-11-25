
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
import android.webkit.WebView
import android.webkit.WebViewClient
import android.webkit.WebChromeClient
import android.webkit.JavascriptInterface
import android.widget.Toast
import java.util.Locale
import org.json.JSONObject

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
        fun listen() {
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
            val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH)

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
            toast("Voice recognition unavailable")
        }
    }

    private fun sendCommand(command: String) {

        val cmd = command.trim().lowercase(Locale.ROOT)

        try {
            when {

                cmd == "youtube:" || cmd == "open:youtube" -> {
                    openYouTube("")
                }

                cmd.startsWith("youtube:") -> {
                    openYouTube(command.substringAfter(":").trim())
                }

                cmd == "google:" || cmd == "open:google" -> {
                    openGoogle("")
                }

                cmd.startsWith("google:") -> {
                    openGoogle(command.substringAfter(":").trim())
                }

                cmd.startsWith("play:") -> {
                    openYouTube(command.substringAfter(":").trim())
                }

                cmd.startsWith("search:") -> {
                    openGoogle(command.substringAfter(":").trim())
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

                cmd == "open:whatsapp" -> {
                    openApp("com.whatsapp")
                }

                cmd == "open:camera" -> {
                    startActivity(
                        Intent(MediaStore.ACTION_IMAGE_CAPTURE)
                    )
                }

                cmd == "open:settings" -> {
                    startActivity(
                        Intent(android.provider.Settings.ACTION_SETTINGS)
                    )
                }

                cmd.startsWith("open:") -> {
                    val site = command.substringAfter(":").trim()
                    openUrl(site)
                }

                else -> {
                    toast("Unknown command: $command")
                }
            }

        } catch (e: Exception) {
            toast("Could not perform this action")
        }
    }

    private fun openYouTube(query: String) {

        if (query.isBlank()) {
            openAppOrUrl(
                "com.google.android.youtube",
                "https://www.youtube.com"
            )
        } else {
            openUrl(
                "https://www.youtube.com/results?search_query=" +
                    Uri.encode(query)
            )
        }
    }

    private fun openGoogle(query: String) {

        val url = if (query.isBlank()) {
            "https://www.google.com"
        } else {
            "https://www.google.com/search?q=" + Uri.encode(query)
        }

        openUrl(url)
    }

    private fun openApp(packageName: String) {

        val intent = packageManager.getLaunchIntentForPackage(packageName)

        if (intent != null) {
            startActivity(intent)
        } else {
            toast("App is not installed")
        }
    }

    private fun openAppOrUrl(packageName: String, url: String) {

        val intent = packageManager.getLaunchIntentForPackage(packageName)

        if (intent != null) {
            startActivity(intent)
        } else {
            openUrl(url)
        }
    }

    private fun openUrl(url: String) {

        val finalUrl = if (
            url.startsWith("https://") || url.startsWith("http://")
        ) {
            url
        } else {
            "https://$url"
        }

        startActivity(
            Intent(Intent.ACTION_VIEW, Uri.parse(finalUrl))
        )
    }

    private fun toast(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
    }

    @Deprecated("Deprecated Android callback")
    override fun onActivityResult(
        requestCode: Int,
        resultCode: Int,
        data: Intent?
    ) {
        super.onActivityResult(requestCode, resultCode, data)

        if (requestCode == REQUEST_SPEECH && resultCode == RESULT_OK) {

            val results = data?.getStringArrayListExtra(
                RecognizerIntent.EXTRA_RESULTS
            )

            val text = results?.firstOrNull() ?: return

            val safeText = JSONObject.quote(text)

            webView.evaluateJavascript(
                "if(typeof onVoiceResult === 'function') " +
                    "onVoiceResult($safeText);",
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

        if (::webView.isInitialized) {
            webView.destroy()
        }

        super.onDestroy()
    }
}              

            
            
