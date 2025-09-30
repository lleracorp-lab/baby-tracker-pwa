// Replace this with your Apps Script Web App URL
const API_BASE = "https://script.google.com/macros/s/XXXXX/exec";
const FAMILY_CODE = "angel-family-8927";  // whatever you used in Alexa

// Load history from Apps Script
async function loadHistory() {
  try {
    const r = await fetch(`${API_BASE}?path=history&userId=${encodeURIComponent(FAMILY_CODE)}`);
    const data = await r.json();

    const feedLogs = (data.feeds || []).map((f, i) => ({
      id: 'feed-' + i,
      type: 'feeding',
      method: f.source === 'breast' ? 'nursing' : 'bottle',
      subtype: f.source,
      amount: f.amount,
      timestamp: new Date(f.timestamp)
    }));

    const diaperLogs = (data.diapers || []).map((d, i) => ({
      id: 'diaper-' + i,
      type: 'diaper',
      subtype: d.type,
      timestamp: new Date(d.timestamp)
    }));

    const logs = [...feedLogs, ...diaperLogs].sort((a,b) => b.timestamp - a.timestamp);
    renderLogs(logs);
  } catch (e) {
    console.error("Load history failed:", e);
    document.getElementById("logs").innerText = "Error loading logs.";
  }
}

// Add a diaper entry
async function logDiaper(type) {
  try {
    await fetch(`${API_BASE}?path=diaper`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: FAMILY_CODE, type, at: new Date().toISOString() })
    });
    loadHistory();
  } catch (e) {
    console.error("Diaper log failed:", e);
  }
}

// Add a feeding entry
async function logFeed(amount, source) {
  try {
    await fetch(`${API_BASE}?path=feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: FAMILY_CODE, amount, unit: "ounces", source, at: new Date().toISOString() })
    });
    loadHistory();
  } catch (e) {
    console.error("Feed log failed:", e);
  }
}

// Render logs into the page
function renderLogs(logs) {
  const list = document.getElementById("logs");
  list.innerHTML = "";

  if (logs.length === 0) {
    list.innerHTML = "<p>No activity yet.</p>";
    return;
  }

  logs.forEach(log => {
    const li = document.createElement("li");
    li.textContent = `${log.type.toUpperCase()}: ${log.subtype || ''} ${log.amount || ''} (${log.timestamp.toLocaleString()})`;
    list.appendChild(li);
  });
}

// Load logs when page opens
window.onload = loadHistory;
