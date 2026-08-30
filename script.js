const API = "https://bible-widget-backend.vercel.app/api/morning";
const CACHE_KEY = "bible_verse";
const DAY_POLL_MS = 15000;
const REGULAR_POLL_MS = 600000;

const dateEl = document.getElementById("date");
const clockEl = document.getElementById("clock");
const statusEl = document.getElementById("status");
const verseEl = document.getElementById("verse");
const refEl = document.getElementById("reference");
const insightBlockEl = document.getElementById("insight-block");
const insightEl = document.getElementById("simplifier");
const stageEl = document.getElementById("stage");
const stageInnerEl = document.getElementById("stage-inner");

let displayedDay = null;
let fetchInFlight = false;
let lastFetchAt = 0;
let fitFrame = 0;

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

function parseIsoDay(day) {
    const [y, m, d] = day.split("-").map(Number);
    return new Date(y, m - 1, d);
}

function dayFromData(data) {
    if (data?.generated_at) {
        return isoDate(new Date(data.generated_at));
    }
    return isoDate(new Date());
}

function updateClock() {
    const now = new Date();
    if (clockEl) {
        clockEl.textContent = formatClock(now);
        clockEl.dateTime = now.toISOString();
    }
}

function setDisplayedDate(day) {
    if (!dateEl || !day) return;
    displayedDay = day;
    const dateObj = parseIsoDay(day);
    dateEl.textContent = formatDate(dateObj);
    dateEl.dateTime = day;
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
    scheduleFit();
}

function hideStatus() {
    statusEl?.classList.add("hidden");
}

function measureScale() {
    if (!stageEl || !stageInnerEl) return 1;
    const availW = stageEl.clientWidth;
    const availH = stageEl.clientHeight;
    if (availW < 8 || availH < 8) return 1;
    const needW = Math.max(stageInnerEl.scrollWidth, stageInnerEl.offsetWidth);
    const needH = Math.max(stageInnerEl.scrollHeight, stageInnerEl.offsetHeight);
    return Math.min(availW / needW, availH / needH, 1);
}

function applyFit() {
    if (!stageEl || !stageInnerEl) return;

    insightBlockEl?.classList.remove("fit-hidden");
    stageInnerEl.style.transform = "none";

    let scale = measureScale();
    if (scale < 0.62 && insightBlockEl && !insightBlockEl.classList.contains("hidden")) {
        insightBlockEl.classList.add("fit-hidden");
        scale = measureScale();
    }

    const next = Math.max(0.42, Math.min(scale, 1));
    stageInnerEl.style.transform = next < 0.999 ? `scale(${next})` : "none";
}

function scheduleFit() {
    cancelAnimationFrame(fitFrame);
    fitFrame = requestAnimationFrame(() => {
        requestAnimationFrame(applyFit);
    });
}

function renderReading(data, { fromCache = false } = {}) {
    if (!verseEl || !refEl) return;

    const text = cleanVerse(data.esv_text);
    if (!text) {
        showStatus("Today’s verse is not available yet.", true);
        return;
    }

    hideStatus();
    setDisplayedDate(dayFromData(data));

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

    scheduleFit();
}

async function loadVerse() {
    if (fetchInFlight) return;
    fetchInFlight = true;
    lastFetchAt = Date.now();

    try {
        const res = await fetch(API, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        renderReading(data);
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error("Verse fetch failed:", error);
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            try {
                renderReading(JSON.parse(cached), { fromCache: true });
                return;
            } catch {
                /* fall through */
            }
        }
        showStatus("Unable to reach today’s verse. The display will try again shortly.", true);
        verseEl?.classList.add("hidden");
        refEl?.classList.add("hidden");
        insightBlockEl?.classList.add("hidden");
    } finally {
        fetchInFlight = false;
    }
}

function onTick() {
    updateClock();
    const today = isoDate(new Date());
    if (displayedDay && today !== displayedDay && Date.now() - lastFetchAt >= DAY_POLL_MS) {
        loadVerse();
    }
}

updateClock();
loadVerse();

setInterval(onTick, 1000);
setInterval(loadVerse, REGULAR_POLL_MS);

window.addEventListener("resize", scheduleFit);
window.addEventListener("orientationchange", scheduleFit);
document.fonts?.ready?.then(scheduleFit);

if (stageEl && typeof ResizeObserver !== "undefined") {
    new ResizeObserver(scheduleFit).observe(stageEl);
}

document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
        updateClock();
        loadVerse();
    }
});
