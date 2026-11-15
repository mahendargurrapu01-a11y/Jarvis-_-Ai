package com.example.jarvis

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.RecognitionListener
import android.speech.tts.TextToSpeech
import android.widget.*
import android.graphics.Color
import android.view.Gravity
import java.util.Locale

class MainActivity : Activity(), TextToSpeech.OnInitListener {

    private lateinit var speech: TextToSpeech
    private var recognizer: SpeechRecognizer? = null
    private lateinit var status: TextView
    private lateinit var output: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        speech = TextToSpeech(this, this)

        val layout = LinearLayout(this)
        layout.orientation = LinearLayout.VERTICAL
        layout.gravity = Gravity.CENTER
        layout.setPadding(30, 30, 30, 30)
        layout.setBackgroundColor(Color.rgb(5, 12, 28))

        val title = TextView(this)
        title.text = "J.A.R.V.I.S"
        title.textSize = 36f
        title.setTextColor(Color.CYAN)
        title.gravity = Gravity.CENTER

        status = TextView(this)
        status.text = "SYSTEM ONLINE"
        status.textSize = 18f
        status.setTextColor(Color.GREEN)
        status.gravity = Gravity.CENTER

        output = TextView(this)
        output.text = "Hello! I am your personal assistant."
        output.textSize = 19f
        output.setTextColor(Color.WHITE)
        output.gravity = Gravity.CENTER

        val button = Button(this)
        button.text = "🎤 ACTIVATE JARVIS"

        button.setOnClickListener {
            startListening()
        }

        layout.addView(title)
        layout.addView(status)
        layout.addView(output)
        layout.addView(button)

        setContentView(layout)
    }

    override fun onInit(result: Int) {
        if (result == TextToSpeech.SUCCESS) {
            speech.language = Locale.US
            speak("Hello. JARVIS is online.")
        }
    }

    private fun speak(message: String) {
        output.text = message
        speech.speak(
            message,
            TextToSpeech.QUEUE_FLUSH,
            null,
            "J
