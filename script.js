
// ==============================
// JARVIS AI - SCRIPT.JS
// ==============================

const API_URL = "https://jarvis-ai-1-vfsw.onrender.com/api/chat";

function $(id) {
    return document.getElementById(id);
}

function addMessage(text, sender) {
    const chat = $("chat");

    if (!chat) {
        console.log(sender + ": " + text);
        return;
    }

    const message = document.createElement("div");
    message.className = "message " + sender;
    message.textContent = text;

    chat.appendChild(message);
    chat.scrollTop = chat.scrollHeight;
}

function speak(text) {
    try {
        if (window.Android && Android.speak) {
            Android.speak(text);
        } else if ("speechSynthesis" in window) {
            speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = "en-IN";

            speechSynthesis.speak(utterance);
        }
    } catch (e) {
        console.log("Speech error:", e);
    }
}

function stopSpeaking() {
    try {
        if (window.Android && Android.stopSpeaking) {
            Android.stopSpeaking();
        }

        if ("speechSynthesis" in window) {
            speechSynthesis.cancel();
        }
    } catch (e) {
        console.log(e);
    }
}

async function askJarvisAI(message) {
    try {
        addMessage("Thinking...", "bot");

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
            throw new Error("Server error " + response.status);
        }

        const data = await response.json();

        const reply =
            data.reply ||
            data.response ||
            data.message ||
            "I couldn't get a response.";

        const chat = $("chat");

        if (chat && chat.lastElementChild) {
            chat.lastElementChild.remove();
        }

        addMessage(reply, "bot");
        speak(reply);

        return reply;

    } catch (error) {
        const chat = $("chat");

        if (chat && chat.lastElementChild &&
            chat.lastElementChild.textContent === "Thinking...") {
            chat.lastElementChild.remove();
        }

        const errorMessage =
            "AI connection failed. Please try again.";

        addMessage(errorMessage, "bot");
        speak(errorMessage);

        console.error(error);
        return errorMessage;
    }
}

async function run(command) {

    const text = command.trim();
    const lower = text.toLowerCase();

    if (!text) return;

    addMessage(text, "user");

    // BASIC COMMANDS

    if (lower === "hello" || lower === "hi") {
        const reply = "Hello! I am Jarvis. How can I help you?";
        addMessage(reply, "bot");
        speak(reply);
        return;
    }

    if (lower.includes("stop speaking")) {
        stopSpeaking();
        return;
    }

    if (lower.includes("open youtube")) {
        native("youtube");
        return;
    }

    if (lower.includes("open google")) {
        native("google");
        return;
    }

    if (lower.includes("open instagram")) {
        native("instagram");
        return;
    }

    if (lower.includes("open camera")) {
        native("camera");
        return;
    }

    if (lower.includes("open settings")) {
        native("settings");
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

    // AI FALLBACK

    await askJarvisAI(text);
}

function native(command) {
    try {
        if (window.Android && Android.action) {
            Android.action(command);
        } else if (window.Android && Android.execute) {
            Android.execute(command);
        } else {
            addMessage("Android connection unavailable.", "bot");
        }
    } catch (e) {
        console.error("Native error:", e);
    }
}

function send() {
    const input = $("input");

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
        } else if (window.Android && Android.startVoice) {
            Android.startVoice();
        } else {
            addMessage("Voice is not available.", "bot");
        }
    } catch (e) {
        console.error(e);
    }
}

function onVoiceResult(text) {
    if (text) {
        run(text);
    }
}

function onVoiceError(error) {
    addMessage("Voice error: " + error, "bot");
}

// BUTTON SETUP

window.send = send;
window.listen = listen;
window.run = run;
window.onVoiceResult = onVoiceResult;
window.onVoiceError = onVoiceError;
window.stopSpeaking = stopSpeaking;

document.addEventListener("DOMContentLoaded", function () {

    const input = $("input");

    if (input) {
        input.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                send();
            }
        });
    }

    console.log("Jarvis script loaded successfully.");
});        


    
