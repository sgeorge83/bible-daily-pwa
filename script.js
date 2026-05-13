const API = "https://bible-widget-backend.vercel.app/api/morning";

async function loadVerse() {
    try {
        const res = await fetch(API);
        const data = await res.json();

        document.getElementById("verse").innerText = data.esv_text;
        document.getElementById("reference").innerText = data.reference;

        localStorage.setItem("bible_verse", JSON.stringify(data));

    } catch (error) {
        console.log("API failed, loading cache...");

        const cached = localStorage.getItem("bible_verse");

        if (cached) {
            const data = JSON.parse(cached);

            document.getElementById("verse").innerText = data.esv_text;
            document.getElementById("reference").innerText = data.reference;

        } else {
            document.getElementById("verse").innerText =
                "Stay still… the Word will return shortly.";
            document.getElementById("reference").innerText = "Offline";
        }
    }
}

window.onload = loadVerse;

// auto refresh every 10 minutes
setInterval(loadVerse, 600000);
