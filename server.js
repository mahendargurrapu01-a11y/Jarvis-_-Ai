
// ======================================
// JARVIS AI - COMPLETE JAVASCRIPT
// ======================================

const $ = id => document.getElementById(id);

const JARVIS_API =
"https://jarvis-ai-1-vfsw.onrender.com/api/chat";

let language = "en";

// ======================================
// LANGUAGE
// ======================================

function changeLanguage() {

    language = $("language").value;

    say(
        language === "te"
        ? "జార్విస్ సిద్ధంగా ఉంది."
        : "JARVIS is ready."
    );
}

// ======================================
// HISTORY
// ======================================

function addHistory(text) {

    const h = $("history");

    if (!h) return;

    if (h.textContent === "No activity yet.") {
        h.textContent = "";
    }

    h.textContent = text + "\n" + h.textContent;
}

// ======================================
// SPEAK
// ======================================

function say(text) {

    if ($("response")) {
        $("response").textContent = text;
    }

    if ($("status")) {
        $("status").textContent = "JARVIS RESPONDING";
    }

    if (window.Android && Android.speak) {

        Android.speak(text);

    } else if ("speechSynthesis" in window) {

        speechSynthesis.cancel();

        const msg = new SpeechSynthesisUtterance(text);

        msg.lang = language === "te"
            ? "te-IN"
            : "en-IN";

        speechSynthesis.speak(msg);
    }

    addHistory("JARVIS: " + text);
}

// ======================================
// ANDROID CONNECTION
// ======================================

function native(action) {

    if (window.Android && Android.execute) {

        Android.execute(action);

    } else {

        say("Please use the Android application.");
    }
}

// ======================================
// AI BACKEND CONNECTION
// ======================================

async function askJarvis(message) {

    try {

        if ($("status")) {
            $("status").textContent = "THINKING...";
        }

        const response = await fetch(JARVIS_API, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: message
            })

        });

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.error || "AI request failed"
            );
        }

        say(data.reply);

    } catch (error) {

        console.error("JARVIS AI ERROR:", error);

        say(
            "Sorry, I cannot connect to my AI server."
        );
    }
}

// ======================================
// COMMAND SYSTEM
// ======================================

function run(command) {

    const c = command.toLowerCase().trim();

    if (!c) return;

    addHistory("YOU: " + command);

    // HELLO

    if (
        c.includes("hello") ||
        c.includes("హలో") ||
        c.includes("నమస్కారం")
    ) {

        say(
            language === "te"
            ? "నమస్కారం! నేను జార్విస్."
            : "Hello! I am JARVIS."
        );
    }

    // WHATSAPP

    else if (
        c.includes("open whatsapp") ||
        c.includes("వాట్సాప్")
    ) {

        say("Opening WhatsApp.");

        native("whatsapp");
    }

    // YOUTUBE

    else if (
        c.includes("open youtube") ||
        c.includes("యూట్యూబ్")
    ) {

        say("Opening YouTube.");

        native("youtube");
    }

    // CAMERA

    else if (
        c.includes("open camera") ||
        c.includes("కెమెరా")
    ) {

        say("Opening camera.");

        native("camera");
    }

    // SETTINGS

    else if (
        c.includes("open settings") ||
        c.includes("సెట్టింగ్స్")
    ) {

        say("Opening settings.");

        native("settings");
    }

    // GOOGLE

    else if (
        c.includes("open google") ||
        c.includes("గూగుల్")
    ) {

        say("Opening Google.");

        native("google");
    }

    // TIME

    else if (
        c.includes("time") ||
        c.includes("సమయం")
    ) {

        const time = new Date().toLocaleTimeString();

        say("The current time is " + time);
    }

    // DATE

    else if (
        c.includes("date") ||
        c.includes("తేదీ")
    ) {

        const date = new Date().toLocaleDateString();

        say("Today's date is " + date);
    }

    // GOOGLE SEARCH

    else if (c.startsWith("search ")) {

        const query = command.substring(7).trim();

        say("Searching Google.");

        native("search:" + query);
    }

    // YOUTUBE SEARCH

    else if (c.startsWith("play ")) {

        const query = command.substring(5).trim();

        say("Searching YouTube.");

        native("play:" + query);
    }

    // PHONE CALL

    else if (c.startsWith("call ")) {

        const number = command.substring(5).trim();

        say("Opening phone dialer.");

        native("call:" + number);
    }

    // STOP

    else if (
        c === "stop" ||
        c.includes("ఆపు")
    ) {

        if ("speechSynthesis" in window) {
            speechSynthesis.cancel();
        }

        say("Okay, stopping.");
    }

    // AI CHAT

    else {

        askJarvis(command);
    }
}

// ======================================
// SEND MESSAGE
// ======================================

function send() {

    const input = $("command");

    if (!input) return;

    const value = input.value.trim();

    if (value) {

        run(value);
    }

    input.value = "";
}

// ======================================
// VOICE RECOGNITION
// ======================================

function listen() {

    if ($("status")) {
        $("status").textContent = "LISTENING...";
    }

    if (window.Android && Android.startVoice) {

        Android.startVoice();

    } else {

        say("Voice input requires the Android application.");
    }
}

// ======================================
// VOICE RESULT
// ======================================

function onVoiceResult(text) {

    if ($("command")) {
        $("command").value = text;
    }

    run(text);
}

// ======================================
// VOICE ERROR
// ======================================

function onVoiceError(error) {

    if ($("status")) {
        $("status").textContent = "VOICE ERROR";
    }

    say(error);
}

// ======================================
// KEYBOARD ENTER
// ======================================

function setupJarvis() {

    const input = $("command");

    if (input) {

        input.addEventListener("keydown", event => {

            if (event.key === "Enter") {

                send();
            }
        });
    }

    if ($("status")) {
        $("status").textContent = "JARVIS ONLINE";
    }

    console.log("JARVIS AI initialized successfully.");
}

// ======================================
// GLOBAL FUNCTIONS FOR HTML AND ANDROID
// ======================================

window.changeLanguage = changeLanguage;
window.send = send;
window.listen = listen;
window.run = run;
window.onVoiceResult = onVoiceResult;
window.onVoiceError = onVoiceError;

// ======================================
// START JARVIS
// ======================================

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        setupJarvis
    );

} else {

    setupJarvis();
}
