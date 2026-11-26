const API_URL = "https://jarvis-ai-1-vfsw.onrender.com/api/chat";

function $(id) {
    return document.getElementById(id);
}

// Display messages and activity history
function addMessage(message, sender) {
    const response = $("response");
    const history = $("history");

    if (response) {
        response.textContent = message;
    }

    if (history) {
        if (history.textContent === "No activity yet.") {
            history.textContent = "";
        }

        const item = document.createElement("div");
        item.textContent = sender.toUpperCase() + ": " + message;
        history.prepend(item);
    }
}

// Speak response
function speak(text) {
    try {
        if (window.Android && Android.speak) {
            Android.speak(text);
        } else if ("speechSynthesis" in window) {
            speechSynthesis.cancel();

            const voice = new SpeechSynthesisUtterance(text);
            voice.lang = "en-IN";

            speechSynthesis.speak(voice);
        }
    } catch (error) {
        console.log("Voice error:", error);
    }
}

// Stop voice
function stopSpeaking() {
    try {
        if (window.Android && Android.stopSpeaking) {
            Android.stopSpeaking();
        }

        if ("speechSynthesis" in window) {
            speechSynthesis.cancel();
        }
    } catch (error) {
        console.log(error);
    }
}

// Send command to Android
function native(command) {
    try {
        if (window.Android && Android.sendCommand) {
            Android.sendCommand(command);
        } else {
            addMessage("Android connection unavailable.", "jarvis");
        }
    } catch (error) {
        addMessage("Action failed.", "jarvis");
    }
}

// Connect to AI server
async function askJarvisAI(message) {
    addMessage("Thinking...", "jarvis");

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
            "I couldn't understand.";

        addMessage(reply, "jarvis");
        speak(reply);

        return reply;

    } catch (error) {
        console.error(error);

        const message = "AI connection failed. Please try again.";

        addMessage(message, "jarvis");
        speak(message);

        return message;
    }
}

// Main command system
async function run(command) {
    const text = command.trim();
    const lower = text.toLowerCase();

    if (!text) return;

    addMessage(text, "you");

    // Greetings
    if (lower === "hello" || lower === "hi") {
        const reply = "Hello! I am JARVIS. How can I help you?";
        addMessage(reply, "jarvis");
        speak(reply);
        return;
    }

    // Stop voice
    if (lower.includes("stop speaking")) {
        stopSpeaking();
        return;
    }

    // Time
    if (lower === "time" || lower.includes("what time")) {
        const reply = "The time is " +
            new Date().toLocaleTimeString();

        addMessage(reply, "jarvis");
        speak(reply);
        return;
    }

    // YouTube
    if (lower === "open youtube") {
        native("youtube:");
        return;
    }

    // Google
    if (lower === "open google") {
        native("google:");
        return;
    }

    // Camera
    if (lower === "open camera") {
        native("open:camera");
        return;
    }

    // Settings
    if (lower === "open settings") {
        native("open:settings");
        return;
    }

    // Open ANY installed app
    if (lower.startsWith("open ")) {
        const appName = text.substring(5).trim();

        if (appName) {
            native("app:" + appName);
        }

        return;
    }

    // Open app using launch or start
    if (lower.startsWith("launch ")) {
        const appName = text.substring(7).trim();

        if (appName) {
            native("app:" + appName);
        }

        return;
    }

    if (lower.startsWith("start ")) {
        const appName = text.substring(6).trim();

        if (appName) {
            native("app:" + appName);
        }

        return;
    }

    // Play on YouTube
    if (lower.startsWith("play ")) {
        native("play:" + text.substring(5));
        return;
    }

    // Google search
    if (lower.startsWith("search ")) {
        native("search:" + text.substring(7));
        return;
    }

    // Phone call
    if (lower.startsWith("call ")) {
        native("call:" + text.substring(5));
        return;
    }

    // Ask AI
    await askJarvisAI(text);
}

// Send typed command
function send() {
    const input = $("command");

    if (!input) return;

    const message = input.value.trim();

    if (!message) return;

    input.value = "";

    run(message);
}

// Activate microphone
function listen() {
    try {
        if (window.Android && Android.listen) {
            Android.listen();
        } else {
            addMessage("Voice is not available.", "jarvis");
        }
    } catch (error) {
        addMessage("Microphone error.", "jarvis");
    }
}

// Receive voice command
function onVoiceResult(text) {
    if (text) {
        run(text);
    }
}

// Voice error
function onVoiceError(error) {
    addMessage("Voice error: " + error, "jarvis");
}

// Language selection
function changeLanguage() {
    const language = $("language");

    if (!language) return;

    const selected = language.value;

    if (selected === "te") {
        addMessage("తెలుగు ఎంపిక చేయబడింది.", "jarvis");
    } else {
        addMessage("English selected.", "jarvis");
    }
}

// Make functions available to HTML
window.send = send;
window.listen = listen;
window.run = run;
window.native = native;
window.onVoiceResult = onVoiceResult;
window.onVoiceError = onVoiceError;
window.changeLanguage = changeLanguage;
window.stopSpeaking = stopSpeaking;

// Start JARVIS
document.addEventListener("DOMContentLoaded", function () {
    const input = $("command");

    if (input) {
        input.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                send();
            }
        });
    }

    console.log("JARVIS AI started successfully.");
});
        
