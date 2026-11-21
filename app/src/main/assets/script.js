function speak(text) {
    if ("speechSynthesis" in window) {
        speechSynthesis.cancel();
        const message = new SpeechSynthesisUtterance(text);
        message.lang = "en-US";
        speechSynthesis.speak(message);
    }
}

function sendCommand(command) {
    const text = command.toLowerCase().trim();

    if (text.includes("hello")) {
        speak("Hello sir. JARVIS is online.");
    } else if (text.includes("who are you")) {
        speak("I am JARVIS, your virtual assistant.");
    } else if (text.includes("time")) {
        speak("The time is " + new Date().toLocaleTimeString());
    } else if (text.includes("date")) {
        speak("Today is " + new Date().toDateString());
    } else if (text.includes("open youtube")) {
        window.open("https://www.youtube.com", "_blank");
        speak("Opening YouTube.");
    } else if (text.includes("open google")) {
        window.open("https://www.google.com", "_blank");
        speak("Opening Google.");
    } else if (text.startsWith("search ")) {
        const query = text.replace("search ", "");
        window.open("https://www.google.com/search?q=" + encodeURIComponent(query), "_blank");
        speak("Searching Google.");
    } else {
        speak("Sorry sir. I don't understand that command yet.");
    }
}

function send() {
    const input = document.getElementById("command");
    if (input && input.value.trim()) {
        sendCommand(input.value);
        input.value = "";
    }
}

function run(command) {
    sendCommand(command);
}
