const API = "https://bible-widget-backend.vercel.app/api/morning";

async function loadVerse() {
    try {
        const res = await fetch(API);
        const data = await res.json();

        // REMOVE duplication risk
        const cleanVerse = data.esv_text
            .replace(/^.*?\d+:\d+\s*/g, "")
            .replace(/\(ESV\)/g, "")
            .trim();

        document.getElementById("verse").innerText = cleanVerse;
        document.getElementById("reference").innerText = data.reference;

        localStorage.setItem("bible_verse", JSON.stringify(data));

    } catch (error) {
        const cached = localStorage.getItem("bible_verse");

        if (cached) {
            const data = JSON.parse(cached);

            document.getElementById("verse").innerText = data.esv_text;
            document.getElementById("reference").innerText = data.reference;
        }
    }
}

window.onload = loadVerse;
setInterval(loadVerse, 600000);
