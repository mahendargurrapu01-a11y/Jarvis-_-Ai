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
import androidx.appcompat.app.AppCompatActivity
import java.util.Locale

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private var tts: TextToSpeech? = null

    private val speechRequest = 1001
    private val permissionRequest = 1002

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        webView = WebView(this)
        setContentView(webView)

        tts = TextToSpeech(this) {
            tts?.language = Locale("en", "IN")
        }

        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        webView.webViewClient = WebViewClient()
        webView.webChromeClient = WebChromeClient()

        webView.addJavascriptInterface(
            JarvisBridge(),
            "Android"
        )

        webView.loadUrl("file:///android_asset/index.html")
    }

    inner class JarvisBridge {

        @JavascriptInterface
        fun startVoice() {
            runOnUiThread {
                startListening()
            }
        }

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
        fun execute(command: String) {
            runOnUiThread {
                executeCommand(command.lowercase().trim())
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
                RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE,
                "en-IN"
            )

            intent.putExtra(
                RecognizerIntent.EXTRA_MAX_RESULTS,
                1
            )

            intent.putExtra(
                RecognizerIntent.EXTRA_PROMPT,
                "Speak to JARVIS"
            )

            startActivityForResult(
                intent,
                speechRequest
            )

        } catch (e: Exception) {
            showMessage("Speech recognition unavailable")
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

                command == "camera" ->
                    startActivity(
                        Intent("android.media.action.IMAGE_CAPTURE")
                    )

                command == "settings" ->
                    startActivity(
                        Intent(android.provider.Settings.ACTION_SETTINGS)
                    )

                command.startsWith("search:") -> {
                    val query = command.removePrefix("search:").trim()

                    val url =
                        "https://www.google.com/search?q=" +
                        Uri.encode(query)

                    startActivity(
                        Intent(Intent.ACTION_VIEW, Uri.parse(url))
                    )
                }

                command.startsWith("play:") -> {
                    val query = command.removePrefix("play:").trim()

                    val url =
                        "https://www.youtube.com/results?search_query=" +
                        Uri.encode(query)

                    startActivity(
                        Intent(Intent.ACTION_VIEW, Uri.parse(url))
                    )
                }

                command.startsWith("call:") -> {
                    val number = command.removePrefix("call:").trim()

                    startActivity(
                        Intent(
                            Intent.ACTION_DIAL,
                            Uri.parse("tel:$number")
                        )
                    )
                }

                else ->
                    showMessage("Command not supported")
            }

        } catch (e: Exception) {
            showMessage("Unable to perform action")
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
        super.onActivityResult(
            requestCode,
            resultCode,
            data
        )

        if (requestCode == speechRequest &&
            resultCode == Activity.RESULT_OK
        ) {

            val results = data?.getStringArrayListExtra(
                RecognizerIntent.EXTRA_RESULTS
            )

            val spokenText = results?.firstOrNull()

            if (spokenText != null) {

                val safeText =
                    org.json.JSONObject.quote(spokenText)

                webView.evaluateJavascript(
                    "onVoiceResult($safeText)",
                    null
                )
            }
        }
    }

    override fun onDestroy() {
        tts?.stop()
        tts?.shutdown()
        webView.destroy()
        super.onDestroy()
    }
}
        

            
