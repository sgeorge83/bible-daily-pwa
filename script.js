const API = "https://bible-widget-backend.vercel.app/api/morning";
const CACHE_KEY = "bible_verse";

const dateEl = document.getElementById("date");
const clockEl = document.getElementById("clock");
const statusEl = document.getElementById("status");
const verseEl = document.getElementById("verse");
const refEl = document.getElementById("reference");
const insightBlockEl = document.getElementById("insight-block");
const insightEl = document.getElementById("simplifier");

function formatDate(now) {
    return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    }).format(now);
}

function formatClock(now) {
    return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
    }).format(now);
}

function isoDate(now) {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function updateClock() {
    const now = new Date();
    if (dateEl) {
        dateEl.textContent = formatDate(now);
        dateEl.dateTime = isoDate(now);
    }
    if (clockEl) {
        clockEl.textContent = formatClock(now);
        clockEl.dateTime = now.toISOString();
    }
}

function cleanVerse(esvText) {
    return (esvText || "")
        .replace(/^[A-Za-z]+\s\d+:\d+\s*/g, "")
        .replace(/\[\d+\]\s*/g, "")
        .replace(/\(ESV\)/g, "")
        .trim();
}

function showStatus(message, isError) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.toggle("error", Boolean(isError));
    statusEl.classList.remove("hidden");
}

function hideStatus() {
    statusEl?.classList.add("hidden");
}

function renderVerse(data, { fromCache = false } = {}) {
    if (!verseEl || !refEl) return;

    const text = cleanVerse(data.esv_text);
    if (!text) {
        showStatus("Today’s verse is not available yet.", true);
        return;
    }

    hideStatus();

    verseEl.textContent = text;
    verseEl.classList.remove("hidden");
    verseEl.classList.remove("updating");
    void verseEl.offsetWidth;
    verseEl.classList.add("updating");

    const reference = data.reference || "";
    refEl.textContent = reference ? `${reference}  ·  ESV` : "ESV";
    refEl.classList.remove("hidden");

    const meaning = (data.simple_meaning || "").trim();
    if (insightEl && insightBlockEl && meaning) {
        insightEl.textContent = meaning;
        insightBlockEl.classList.remove("hidden");
    } else {
        insightBlockEl?.classList.add("hidden");
    }

    if (fromCache) {
        verseEl.setAttribute("data-source", "cached");
    } else {
        verseEl.removeAttribute("data-source");
    }
}

async function loadVerse() {
    try {
        const res = await fetch(API, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        renderVerse(data);
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error("Verse fetch failed:", error);
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            try {
                renderVerse(JSON.parse(cached), { fromCache: true });
                return;
            } catch {
                /* fall through */
            }
        }
        showStatus("Unable to reach today’s verse. The display will try again shortly.", true);
        verseEl?.classList.add("hidden");
        refEl?.classList.add("hidden");
        insightBlockEl?.classList.add("hidden");
    }
}

updateClock();
loadVerse();

setInterval(updateClock, 1000);
setInterval(loadVerse, 600000);

document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
        updateClock();
        loadVerse();
    }
});
