const API = "https://bible-widget-backend.vercel.app/api/morning";

async function loadVerse() {
    try {
        console.log("🔥 FETCH START");

        const res = await fetch(API);
        const data = await res.json();

        console.log("DATA:", data);

        // Safe DOM references
        const verseEl = document.getElementById("verse");
        const refEl = document.getElementById("reference");
        const insightEl = document.getElementById("simplifier"); // AI content
        const insightTitleEl = document.getElementById("insight-title");
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

        // Render Verse Insight (AI)
        if (insightEl && data.simple_meaning) {
            insightEl.innerText = data.simple_meaning;
            insightEl.classList.remove("hidden");
        }

        // Show Insight title
        if (insightTitleEl && data.simple_meaning) {
            insightTitleEl.classList.remove("hidden");
        }

        // Hide loader
        if (loaderEl) {
            loaderEl.classList.add("hidden");
        }

        // Show main content
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
            const insightEl = document.getElementById("simplifier");
            const insightTitleEl = document.getElementById("insight-title");

            const cleanVerse = (data.esv_text || "")
                .replace(/^[A-Za-z]+\s\d+:\d+\s*/g, "")
                .replace(/\[\d+\]\s*/g, "")
                .replace(/\(ESV\)/g, "")
                .trim();

            if (verseEl) verseEl.innerText = cleanVerse;
            if (refEl) refEl.innerText = data.reference || "";

            if (insightEl && data.simple_meaning) {
                insightEl.innerText = data.simple_meaning;
                insightEl.classList.remove("hidden");
            }

            if (insightTitleEl && data.simple_meaning) {
                insightTitleEl.classList.remove("hidden");
            }

            verseEl?.classList.remove("hidden");
            refEl?.classList.remove("hidden");
        }
    }
}

window.onload = loadVerse;
setInterval(loadVerse, 600000);
