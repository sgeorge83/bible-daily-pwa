console.log("🔥 SCRIPT LOADED SUCCESSFULLY");

window.onload = function () {
    console.log("🔥 WINDOW LOADED");

    loadVerse();
};

const API = "https://bible-widget-backend.vercel.app/api/morning";

async function loadVerse() {
    console.log("🔥 FETCH START");

    try {
        const res = await fetch(API);
        console.log("🔥 STATUS:", res.status);

        const data = await res.json();
        console.log("🔥 DATA RECEIVED:", data);

        document.getElementById("verse").innerText = data.esv_text;
        document.getElementById("reference").innerText = data.reference;

    } catch (err) {
        console.log("❌ ERROR:", err);
    }
}
