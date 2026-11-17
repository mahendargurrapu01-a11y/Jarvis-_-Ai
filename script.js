const $ = id => document.getElementById(id);

let language = "en";

function changeLanguage() {
    language = $("language").value;

    say(
        language === "te"
        ? "జార్విస్ సిద్ధంగా ఉంది."
        : "JARVIS is ready."
    );
}

function addHistory(text) {
    const h = $("history");

    if (h.textContent === "No activity yet.") {
        h.textContent = "";
    }

    h.textContent = text + "\n" + h.textContent;
}

function say(text) {

    $("response").textContent = text;
    $("status").textContent = "JARVIS RESPONDING";

    if (window.Android && Android.speak) {
        Android.speak(text);
    } else if ("speechSynthesis" in window) {

        speechSynthesis.cancel();

        const msg = new SpeechSynthesisUtterance(text);

        msg.lang = language === "te" ? "te-IN" : "en-IN";

        speechSynthesis.speak(msg);
    }

    addHistory("JARVIS: " + text);
}

function native(action) {

    if (window.Android && Android.action) {
        Android.action(action);
    } else {
        say("Please use the Android application.");
    }
}

function run(command) {

    let c = command.toLowerCase().trim();

    addHistory("YOU: " + command);

    // English and Telugu commands

    if (
        c.includes("hello") ||
        c.includes("హలో") ||
        c.includes("నమస్కారం")
    ) {
        say(language === "te"
            ? "నమస్కారం! నేను జార్విస్."
            : "Hello! I am JARVIS.");
    }

    else if (
        c.includes("open whatsapp") ||
        c.includes("వాట్సాప్")
    ) {
        say("Opening WhatsApp.");
        native("whatsapp");
    }

    else if (
        c.includes("open youtube") ||
        c.includes("యూట్యూబ్")
    ) {
        say("Opening YouTube.");
        native("youtube");
    }

    else if (
        c.includes("open camera") ||
        c.includes("కెమెరా")
    ) {
        say("Opening camera.");
        native("camera");
    }

    else if (
        c.includes("open settings") ||
        c.includes("సెట్టింగ్స్")
    ) {
        say("Opening settings.");
        native("settings");
    }

    else if (
        c.includes("open google") ||
        c.includes("గూగుల్")
    ) {
        say("Opening Google.");
        native("google");
    }

    else if (
        c.includes("time") ||
        c.includes("సమయం")
    ) {
        const time = new Date().toLocaleTimeString();

        say(
            language === "te"
            ? "ఇప్పుడు సమయం " + time
            : "The current time is " + time
        );
    }

    else if (
        c.includes("date") ||
        c.includes("తేదీ")
    ) {
        const date = new Date().toLocaleDateString();

        say(
            language === "te"
            ? "ఈరోజు తేదీ " + date
            : "Today's date is " + date
        );
    }

    else if (c.startsWith("search ")) {

        const query = command.substring(7).trim();

        say("Searching Google.");

        native("search:" + query);
    }

    else if (c.startsWith("play ")) {

        const query = command.substring(5).trim();

        say("Searching YouTube.");

        native("play:" + query);
    }

    else if (c.startsWith("call ")) {

        const number = command.substring(5).trim();

        say("Opening phone dialer. Please confirm the call.");

        native("call:" + number);
    }

    else if (
        c === "stop" ||
        c.includes("ఆపు")
    ) {

        if (window.Android && Android.stopSpeaking) {
            Android.stopSpeaking();
        }

        say(
            language === "te"
            ? "సరే, ఆపుతున్నాను."
            : "Okay, stopping."
        );
    }

    else {

        say(
            language === "te"
            ? "క్షమించండి. ఆ కమాండ్ నాకు అర్థం కాలేదు."
            : "Sorry, I don't understand that command yet."
        );
    }
}

function send() {

    const input = $("command");

    const value = input.value.trim();

    if (value) {
        run(value);
    }

    input.value = "";
}

function listen() {

    $("status").textContent = "LISTENING...";

    if (window.Android && Android.listen) {
        Android.listen();
    } else {
        say("Voice input requires the Android application.");
    }
}

function onVoiceResult(text) {

    $("command").value = text;

    run(text);
}

function onVoiceError(error) {

    $("status").textContent = "VOICE ERROR";

    say(error);
}

$("command").addEventListener("keydown", event => {

    if (event.key === "Enter") {
        send();
    }

});
