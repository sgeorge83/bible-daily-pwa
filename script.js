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

function escapeHtml(value) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function collapseSpaces(value) {
    return (value || "").replace(/\s+/g, " ").trim();
}

function formatVerseHtml(esvText) {
    let text = (esvText || "").replace(/\s*\(ESV\)\s*$/i, "").trim();
    text = text.replace(
        /^(?:[1-3]\s+)?[A-Za-z][A-Za-z]*(?:\s+[A-Za-z]+)*\s+\d+:\d+(?:\s*[–—−-]\s*\d+)?\s*/u,
        ""
    );

    const chunks = text.split(/\[(\d+)\]\s*/);
    if (chunks.length < 3) {
        const fallback = collapseSpaces(text);
        return fallback ? `<span class="verse-unit">${escapeHtml(fallback)}</span>` : "";
    }

    let html = "";
    const lead = collapseSpaces(chunks[0]);
    if (lead) {
        html += `<span class="verse-unit">${escapeHtml(lead)}</span>`;
    }

    for (let i = 1; i < chunks.length; i += 2) {
        const num = chunks[i];
        const body = collapseSpaces(chunks[i + 1] || "");
        if (!body) continue;
        html += `<span class="verse-unit"><span class="vnum">${escapeHtml(num)}</span>${escapeHtml(body)}</span>`;
    }

    return html;
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

function overflows() {
    if (!stageEl || !stageInnerEl) return false;
    return stageInnerEl.scrollHeight - stageEl.clientHeight > 2
        || stageInnerEl.scrollWidth - stageEl.clientWidth > 2;
}

function applyFit() {
    if (!stageEl || !stageInnerEl) return;

    insightBlockEl?.classList.remove("fit-hidden");
    stageInnerEl.style.transform = "none";

    const search = () => {
        let low = 0.5;
        let high = 1;
        let best = 0.5;
        for (let i = 0; i < 14; i += 1) {
            const mid = (low + high) / 2;
            stageInnerEl.style.setProperty("--fit", String(mid));
            if (overflows()) {
                high = mid;
            } else {
                best = mid;
                low = mid;
            }
        }
        stageInnerEl.style.setProperty("--fit", String(best));
        return best;
    };

    let best = search();
    if (best < 0.64 && insightBlockEl && !insightBlockEl.classList.contains("hidden")) {
        insightBlockEl.classList.add("fit-hidden");
        best = search();
    }
}

function scheduleFit() {
    cancelAnimationFrame(fitFrame);
    fitFrame = requestAnimationFrame(() => {
        requestAnimationFrame(applyFit);
    });
}

function renderReading(data, { fromCache = false } = {}) {
    if (!verseEl || !refEl) return;

    const html = formatVerseHtml(data.esv_text);
    if (!html) {
        showStatus("Today’s verse is not available yet.", true);
        return;
    }

    hideStatus();
    setDisplayedDate(dayFromData(data));

    verseEl.innerHTML = html;
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
