
// =====================================
// JARVIS AI - COMPLETE SCRIPT
// =====================================

const $ = id => document.getElementById(id);

let language = "en";
let aiBusy = false;

const API_URL =
    "https://jarvis-ai-1-vfsw.onrender.com/api/chat";


// =====================================
// LANGUAGE
// =====================================

function changeLanguage() {

    language = $("language").value;

    say(
        language === "te"
            ? "జార్విస్ సిద్ధంగా ఉంది."
            : "JARVIS is ready."
    );
}


// =====================================
// CHAT HISTORY
// =====================================

function addHistory(text) {

    const h = $("history");

    if (!h) return;

    if (h.textContent === "No activity yet.") {
        h.textContent = "";
    }

    h.textContent =
        text + "\n" + h.textContent;
}


// =====================================
// TEXT TO SPEECH
// =====================================

function say(text) {

    $("response").textContent = text;

    $("status").textContent = "JARVIS RESPONDING";

    if (window.Android && Android.speak) {

        Android.speak(text);

    } else if ("speechSynthesis" in window) {

        speechSynthesis.cancel();

        const msg =
            new SpeechSynthesisUtterance(text);

        msg.lang =
            language === "te" ? "te-IN" : "en-IN";

        speechSynthesis.speak(msg);
    }

    addHistory("JARVIS: " + text);
}


// =====================================
// ANDROID NATIVE COMMANDS
// =====================================

function native(action) {

    if (window.Android && Android.action) {

        Android.action(action);

    } else {

        say("Please use the Android application.");
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

    $("status").textContent = "THINKING...";

    $("response").textContent =
        "JARVIS is thinking...";

    try {

        const controller = new AbortController();

        const timeout = setTimeout(
            () => controller.abort(),
            60000
        );

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

        clearTimeout(timeout);

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.error || "Server error: " + response.status
            );
        }

        const answer =
            data.reply ||
            data.response ||
            data.message;

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
                "Sorry, I cannot connect to my AI brain right now. Please check the server."
            );
        }

    } finally {

        aiBusy = false;
    }
}


// =====================================
// COMMAND PROCESSING
// =====================================

function run(command) {

    let c = command.toLowerCase().trim();

    if (!c) return;

    addHistory("YOU: " + command);


    // HELLO

    if (
        if (
    c === "hello" ||
    c === "hi" ||
    c === "హలో" ||
    c === "నమస్కారం"
)
    

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


    // YOUTUBE SEARCH

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

        say(
            "Opening phone dialer. Please confirm the call."
        );

        native("call:" + number);
    }


    // STOP

    else if (
        c === "stop" ||
        c.includes("ఆపు")
    ) {

        if (
            window.Android &&
            Android.stopSpeaking
        ) {

            Android.stopSpeaking();

        } else if ("speechSynthesis" in window) {

            speechSynthesis.cancel();
        }

        $("status").textContent = "STOPPED";

    }


    // AI CHAT

    else {

        askJarvisAI(command);
    }

}


// =====================================
// SEND MESSAGE
// =====================================

function send() {

    const input = $("command");

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

    $("status").textContent = "LISTENING...";

    if (
        window.Android &&
        Android.listen
    ) {

        Android.listen();

    } else {

        say(
            "Voice input requires the Android application."
        );
    }
}


// =====================================
// VOICE RESULT
// =====================================

function onVoiceResult(text) {

    $("command").value = text;

    run(text);
}


// =====================================
// VOICE ERROR
// =====================================

function onVoiceError(error) {

    $("status").textContent = "VOICE ERROR";

    say(error);
}


// =====================================
// ENTER KEY
// =====================================

$("command").addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            send();
        }
    }
);


// =====================================
// JARVIS READY
// =====================================

console.log("JARVIS AI initialized successfully.");
