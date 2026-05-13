const API = "https://bible-widget-backend.vercel.app/api/morning";

async function loadVerse() {
    try {
        console.log("🔥 FETCH START");

        const res = await fetch(API);
        const data = await res.json();

        console.log("DATA:", data);

        // Safe DOM references (prevents crashes)
        const verseEl = document.getElementById("verse");
        const refEl = document.getElementById("reference");
        const simEl = document.getElementById("simplifier");
        const loaderEl = document.getElementById("loader");

        if (!verseEl || !refEl) {
            console.error("❌ Missing required DOM elements");
            return;
        }

        // Clean verse safely
        const cleanVerse = (data.esv_text || "")
            .replace(/^[A-Za-z]+\s\d+:\d+\s*/g, "")
            .replace(/\[\d+\]\s*/g, "")
            .replace(/\(ESV\)/g, "")
            .trim();

        // Render Verse
        verseEl.innerText = cleanVerse;

        // Render Reference
        refEl.innerText = data.reference || "";

        // Render Simple Meaning (SAFE)
        if (simEl && data.simple_meaning) {
            simEl.innerText = data.simple_meaning;
            simEl.classList.remove("hidden");
        }

        // Hide loader safely
        if (loaderEl) {
            loaderEl.classList.add("hidden");
        }

        // Show content safely
        verseEl.classList.remove("hidden");
        refEl.classList.remove("hidden");

        // Cache data
        localStorage.setItem("bible_verse", JSON.stringify(data));

    } catch (error) {
        console.error("❌ ERROR:", error);

        const cached = localStorage.getItem("bible_verse");

        if (cached) {
            const data = JSON.parse(cached);

            const verseEl = document.getElementById("verse");
            const refEl = document.getElementById("reference");
            const simEl = document.getElementById("simplifier");

            const cleanVerse = (data.esv_text || "")
                .replace(/^[A-Za-z]+\s\d+:\d+\s*/g, "")
                .replace(/\[\d+\]\s*/g, "")
                .replace(/\(ESV\)/g, "")
                .trim();

            if (verseEl) verseEl.innerText = cleanVerse;
            if (refEl) refEl.innerText = data.reference || "";
            if (simEl && data.simple_meaning) simEl.innerText = data.simple_meaning;

            verseEl?.classList.remove("hidden");
            refEl?.classList.remove("hidden");
            simEl?.classList.remove("hidden");
        }
    }
}

window.onload = loadVerse;
setInterval(loadVerse, 600000);
