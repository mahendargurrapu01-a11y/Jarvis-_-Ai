
// ==============================
// JARVIS AI - FIXED SCRIPT.JS
// ==============================

const API_URL = "https://jarvis-ai-1-vfsw.onrender.com/api/chat";

function $(id) {
    return document.getElementById(id);
}

function showResponse(text) {
    const response = $("response");

    if (response) {
        response.textContent = text;
    }
}

function addMessage(text, sender) {
    const history = $("history");

    if (history) {
        if (history.textContent === "No activity yet.") {
            history.textContent = "";
        }

        const item = document.createElement("div");
        item.textContent = sender.toUpperCase() + ": " + text;
        history.appendChild(item);
    }

    showResponse(text);
}

function speak(text) {
    try {
        if (window.Android && Android.speak) {
            Android.speak(text);
        } else if ("speechSynthesis" in window) {
            speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = $("language")?.value === "te"
                ? "te-IN" : "en-IN";

            speechSynthesis.speak(utterance);
        }
    } catch (error) {
        console.log("Speech error:", error);
    }
}

function stopSpeaking() {
    if ("speechSynthesis" in window) {
        speechSynthesis.cancel();
    }
}

async function askJarvisAI(message) {
    showResponse("JARVIS is thinking...");

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message
            })
        });

        if (!response.ok) {
            throw new Error("Server error: " + response.status);
        }

        const data = await response.json();

        const reply =
            data.reply ||
            data.response ||
            data.message ||
            "I could not get a response.";

        addMessage(reply, "JARVIS");
        speak(reply);

        return reply;

    } catch (error) {
        console.error(error);

        const message =
            "AI connection failed. Please check your internet connection.";

        addMessage(message, "JARVIS");
        speak(message);

        return message;
    }
}

function native(command) {
    try {
        if (window.Android && Android.sendCommand) {
            Android.sendCommand(command);
        } else {
            showResponse("Android connection unavailable.");
        }
    } catch (error) {
        console.error("Android error:", error);
        showResponse("Command failed.");
    }
}

async function run(command) {
    const text = command.trim();
    const lower = text.toLowerCase();

    if (!text) return;

    addMessage(text, "YOU");

    if (lower === "hello" || lower === "hi") {
        const reply = "Hello! I am Jarvis. How can I help you?";
        addMessage(reply, "JARVIS");
        speak(reply);
        return;
    }

    if (lower.includes("stop speaking")) {
        stopSpeaking();
        return;
    }

    if (lower.includes("open youtube")) {
        native("youtube:");
        return;
    }

    if (lower.includes("open google")) {
        native("google:");
        return;
    }

    if (lower.includes("open whatsapp")) {
        native("open:whatsapp");
        return;
    }

    if (lower.includes("open camera")) {
        native("open:camera");
        return;
    }

    if (lower.includes("open settings")) {
        native("open:settings");
        return;
    }

    if (lower.startsWith("call ")) {
        native("call:" + text.substring(5));
        return;
    }

    await askJarvisAI(text);
}

function send() {
    const input = $("command");

    if (!input) return;

    const message = input.value.trim();

    if (!message) return;

    input.value = "";
    run(message);
}

function listen() {
    try {
        if (window.Android && Android.listen) {
            Android.listen();
        } else {
            showResponse("Voice connection unavailable.");
        }
    } catch (error) {
        console.error(error);
        showResponse("Could not start voice recognition.");
    }
}

function onVoiceResult(text) {
    if (text) {
        run(text);
    }
}

function onVoiceError(error) {
    showResponse("Voice error: " + error);
}

function changeLanguage() {
    const language = $("language");

    if (language && language.value === "te") {
        showResponse("జార్విస్ సిద్ధంగా ఉంది. మీ ఆదేశం చెప్పండి.");
    } else {
        showResponse("Hello! JARVIS is ready.");
    }
}

// Make functions available to HTML
window.send = send;
window.listen = listen;
window.run = run;
window.onVoiceResult = onVoiceResult;
window.onVoiceError = onVoiceError;
window.stopSpeaking = stopSpeaking;
window.changeLanguage = changeLanguage;

document.addEventListener("DOMContentLoaded", function () {
    console.log("JARVIS AI script loaded.");
});
