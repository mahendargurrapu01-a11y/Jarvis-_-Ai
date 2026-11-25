function speak(text) {
    document.getElementById("response").innerText = text;

    if (window.Android) {
        Android.speak(text);
    }
}

function sendCommand(command) {
    const text = command.toLowerCase().trim();
    let reply = "";

    if (text.includes("hello")) {
        reply = "Hello sir. JARVIS is online.";
    }
    else if (text.includes("who are you")) {
        reply = "I am JARVIS, your personal AI assistant.";
    }
    else if (text.includes("time")) {
        reply = "The time is " + new Date().toLocaleTimeString();
    }
    else if (text.includes("date")) {
        reply = "Today is " + new Date().toDateString();
    }
    else if (text.includes("open whatsapp")) {
        reply = "Opening WhatsApp.";
        Android.action("whatsapp");
    }
    else if (text.includes("open youtube")) {
        reply = "Opening YouTube.";
        Android.action("youtube");
    }
    else if (text.includes("open google")) {
        reply = "Opening Google.";
        Android.action("google");
    }
    else if (text.includes("open camera")) {
        reply = "Opening camera.";
        Android.action("camera");
    }
    else if (text.includes("open settings")) {
        reply = "Opening settings.";
        Android.action("settings");
    }
    else if (text.startsWith("search ")) {
        reply = "Searching Google.";
        Android.action("search:" + text.replace("search ", ""));
    }
    else {
        reply = "Sorry sir. I don't understand that command.";
    }

    speak(reply);

    document.getElementById("history").innerText =
        text + " → " + reply;
}

function send() {
    const input = document.getElementById("command");

    if (input.value.trim()) {
        sendCommand(input.value);
        input.value = "";
    }
}

function run(command) {
    sendCommand(command);
}

function onVoiceResult(text) {
    sendCommand(text);
}

function changeLanguage() {
    const language = document.getElementById("language").value;

    if (language === "te") {
        Android.speak("తెలుగు భాష ఎంపిక చేయబడింది");
    } else {
        Android.speak("English language selected");
    }
}
function listen() {
    if (window.Android &&
        typeof Android.listen === "function") {

        document.getElementById("status").innerText =
            "LISTENING...";

        Android.listen();

    } else {
        speak("Microphone is not available.");
    }
