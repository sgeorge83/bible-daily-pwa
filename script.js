const API = "https://bible-widget-backend.vercel.app/api/morning";

async function loadVerse() {
    try {
        // Optional: show loading state
        document.getElementById("loader")?.classList.remove("hidden");

        const res = await fetch(API);
        const data = await res.json();

        // Clean verse text
        const cleanVerse = data.esv_text
            .replace(/^[A-Za-z]+\s\d+:\d+\s*/g, "")
            .replace(/\[\d+\]\s*/g, "")
            .replace(/\(ESV\)/g, "")
            .trim();

        // Verse
        document.getElementById("verse").innerText = cleanVerse;

        // Reference
        document.getElementById("reference").innerText = data.reference;

        // Simple Meaning (AI)
        document.getElementById("simplifier").innerText = data.simple_meaning || "";

        // Hide loader + show content
        document.getElementById("loader")?.classList.add("hidden");
        document.getElementById("verse").classList.remove("hidden");
        document.getElementById("reference").classList.remove("hidden");
        document.getElementById("simplifier")?.classList.remove("hidden");

        // Cache latest data
        localStorage.setItem("bible_verse", JSON.stringify(data));

    } catch (error) {
        console.log("Fetch failed, using cache:", error);

        const cached = localStorage.getItem("bible_verse");

        if (cached) {
            const data = JSON.parse(cached);

            const cleanVerse = data.esv_text
                .replace(/^[A-Za-z]+\s\d+:\d+\s*/g, "")
                .replace(/\[\d+\]\s*/g, "")
                .replace(/\(ESV\)/g, "")
                .trim();

            document.getElementById("verse").innerText = cleanVerse;
            document.getElementById("reference").innerText = data.reference;
            document.getElementById("simplifier").innerText = data.simple_meaning || "";

            document.getElementById("verse").classList.remove("hidden");
            document.getElementById("reference").classList.remove("hidden");
            document.getElementById("simplifier")?.classList.remove("hidden");
        }
    }
}

window.onload = loadVerse;

// Auto refresh every 10 minutes
setInterval(loadVerse, 600000);
