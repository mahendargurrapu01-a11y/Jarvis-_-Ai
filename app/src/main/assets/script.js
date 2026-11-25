const API_URL = "https://jarvis-ai-1-vfsw.onrender.com/api/chat";

function $(id) {
    return document.getElementById(id);
}

function show(text) {
    const response = $("response");
    if (response) response.textContent = text;
}

function addMessage(text, sender) {
    const history = $("history");

    if (history) {
        if (history.textContent === "No activity yet.") {
            history.textContent = "";
        }

        const item = document.createElement("div");
        item.textContent = sender + ": " + text;
        history.appendChild(item);
    }

    show(text);
}

function speak(text) {
    if (window.Android && Android.speak) {
        Android.speak(text);
    } else if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-IN";
        speechSynthesis.speak(utterance);
    }
}

function native(command) {
    if (window.Android && Android.sendCommand) {
        Android.sendCommand(command);
    } else {
        show("Android connection unavailable.");
    }
}

async function askJarvisAI(message) {
    show("JARVIS is thinking...");

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message })
        });

        if (!response.ok) throw new Error("Server error");

        const data = await response.json();

        const reply = data.reply || data.response ||
                      data.message || "No response received.";

        addMessage(reply, "JARVIS");
        speak(reply);

    } catch (error) {
        console.error(error);
        const reply = "AI connection failed. Check your internet.";
        addMessage(reply, "JARVIS");
        speak(reply);
    }
}

async function run(command) {
    const text = command.trim();
    const lower = text.toLowerCase();

    if (!text) return;

    addMessage(text, "YOU");

    if (lower === "hello" || lower === "hi" ||
        lower === "hello jarvis") {
        speak("Hello! I am Jarvis. How can I help you?");
        return;
    }

    if (lower.includes("stop speaking")) {
        if (window.Android && Android.stopSpeaking) {
            Android.stopSpeaking();
        }
        if ("speechSynthesis" in window) speechSynthesis.cancel();
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

    if (lower.startsWith("play ")) {
        native("play:" + text.substring(5));
        return;
    }

    if (lower.startsWith("search ")) {
        native("search:" + text.substring(7));
        return;
    }

    if (lower.startsWith("call ")) {
        native("call:" + text.substring(5));
        return;
    }

    if (lower.includes("time")) {
        const now = new Date();
        const time = now.toLocaleTimeString("en-IN", {
            hour: "numeric",
            minute: "2-digit"
        });

        const reply = "The time is " + time;
        addMessage(reply, "JARVIS");
        speak(reply);
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
    if (window.Android && Android.listen) {
        Android.listen();
    } else {
        show("Microphone connection unavailable.");
    }
}

function onVoiceResult(text) {
    if (text) run(text);
}

function onVoiceError(error) {
    show("Voice error: " + error);
}

function changeLanguage() {
    const language = $("language");

    show(language && language.value === "te"
        ? "జార్విస్ సిద్ధంగా ఉంది."
        : "JARVIS is ready.");
}

window.send = send;
window.listen = listen;
window.run = run;
window.onVoiceResult = onVoiceResult;
window.onVoiceError = onVoiceError;
window.changeLanguage = changeLanguage;
window.stopSpeaking = function() {
    if ("speechSynthesis" in window) speechSynthesis.cancel();
};

document.addEventListener("DOMContentLoaded", function() {
    console.log("JARVIS voice system loaded.");
});
