// =====================================
// JARVIS AI - COMPLETE SCRIPT
// =====================================

const $ = id => document.getElementById(id);

const API_URL =
"https://jarvis-ai-1-vfsw.onrender.com/api/chat";

let language = "en";
let aiBusy = false;


// =====================================
// LANGUAGE
// =====================================

function changeLanguage() {

    const selector = $("language");

    if (!selector) return;

    language = selector.value;

    say(
        language === "te"
        ? "జార్విస్ సిద్ధంగా ఉంది."
        : "JARVIS is ready."
    );
}


// =====================================
// HISTORY
// =====================================

function addHistory(text) {

    const history = $("history");

    if (!history) return;

    if (history.textContent === "No activity yet.") {
        history.textContent = "";
    }

    history.textContent =
        text + "\n" + history.textContent;
}


// =====================================
// SPEECH
// =====================================

function say(text) {

    const response = $("response");
    const status = $("status");

    if (response) response.textContent = text;

    if (status) status.textContent = "JARVIS RESPONDING";

    addHistory("JARVIS: " + text);

    if (window.Android && Android.speak) {

        Android.speak(String(text));

    } else if ("speechSynthesis" in window) {

        speechSynthesis.cancel();

        const message =
            new SpeechSynthesisUtterance(text);

        message.lang =
            language === "te" ? "te-IN" : "en-IN";

        speechSynthesis.speak(message);
    }
}


// =====================================
// ANDROID CONNECTION
// =====================================

function native(action) {

    if (window.Android && Android.execute) {

        Android.execute(action);

    } else {

        say("Please use the JARVIS Android application.");
    }
}


// =====================================
// AI SERVER CONNECTION
// =====================================

async function askJarvisAI(message) {

    if (aiBusy) {
        say("Please wait. I am processing your previous question.");
        return;
    }

    aiBusy = true;

    const status = $("status");
    const responseBox = $("response");

    if (status) status.textContent = "THINKING...";

    if (responseBox) {
        responseBox.textContent = "JARVIS is thinking...";
    }

    const controller = new AbortController();

    const timeout = setTimeout(
        () => controller.abort(),
        60000
    );

    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                message: message,

                language: language

            }),

            signal: controller.signal

        });

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.error || "AI server error"
            );
        }

        const answer = data.reply;

        if (!answer || typeof answer !== "string") {

            throw new Error(
                "The server did not return an AI response."
            );
        }

        say(answer);

    } catch (error) {

        console.error("JARVIS AI ERROR:", error);

        if (error.name === "AbortError") {

            say("My server is taking too long. Please try again.");

        } else {

            say(
                "Sorry, I cannot connect to my AI server. Please check your internet connection."
            );
        }

    } finally {

        clearTimeout(timeout);

        aiBusy = false;
    }
}


// =====================================
// COMMAND PROCESSING
// =====================================

function run(command) {

    const c = command.toLowerCase().trim();

    if (!c) return;

    addHistory("YOU: " + command);


    // HELLO

    if (
        c === "hello" ||
        c === "hi" ||
        c.includes("నమస్కారం") ||
        c.includes("హలో")
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
        c === "open google" ||
        c === "google"
    ) {

        say("Opening Google.");

        native("google");
    }


    // TIME

    else if (
        c.includes("time") ||
        c.includes("సమయం")
    ) {

        const time =
            new Date().toLocaleTimeString();

        say(
            language === "te"
            ? "ఇప్పుడు సమయం " + time
            : "The current time is " + time
        );
    }


    // DATE

    else if (
        c.includes("date") ||
        c.includes("తేదీ")
    ) {

        const date =
            new Date().toLocaleDateString();

        say(
            language === "te"
            ? "ఈరోజు తేదీ " + date
            : "Today's date is " + date
        );
    }


    // GOOGLE SEARCH

    else if (c.startsWith("search ")) {

        const query =
            command.substring(7).trim();

        say("Searching Google.");

        native("search:" + query);
    }


    // PLAY MUSIC

    else if (c.startsWith("play ")) {

        const query =
            command.substring(5).trim();

        say("Searching YouTube.");

        native("play:" + query);
    }


    // PHONE CALL

    else if (c.startsWith("call ")) {

        const number =
            command.substring(5).trim();

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

        say(
            language === "te"
            ? "సరే, ఆపుతున్నాను."
            : "Okay, stopping."
        );
    }


    // UNKNOWN COMMAND = AI CHAT

    else {

        askJarvisAI(command);
    }
}


// =====================================
// SEND MESSAGE
// =====================================

function send() {

    const input = $("command");

    if (!input) return;

    const value = input.value.trim();

    if (value) {

        run(value);
    }

    input.value = "";
}


// =====================================
// VOICE LISTENING
// =====================================

function listen() {

    const status = $("status");

    if (status) status.textContent = "LISTENING...";

    if (window.Android && Android.startVoice) {

        Android.startVoice();

    } else {

        say("Voice input requires the Android application.");
    }
}


// =====================================
// ANDROID VOICE CALLBACK
// =====================================

function onVoiceResult(text) {

    const input = $("command");

    if (input) {
        input.value = text;
    }

    run(text);
}


function onVoiceError(error) {

    const status = $("status");

    if (status) status.textContent = "VOICE ERROR";

    say(String(error));
}


// =====================================
// ENTER KEY
// =====================================

document.addEventListener("DOMContentLoaded", () => {

    const input = $("command");

    if (input) {

        input.addEventListener("keydown", event => {

            if (event.key === "Enter") {

                send();
            }
        });
    }

});


// =====================================
// JARVIS READY
// =====================================

console.log("JARVIS AI script loaded successfully.");
