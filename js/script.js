/**
 * script.js — production logic for index.html
 *
 * Data sources (swap these when connecting PHP):
 *   Stats  → fetch('api/getStats.php')
 *   Trains → fetch('api/getTrains.php')
 *   Search → fetch('api/search.php?from=…&to=…&date=…')
 *   Book   → fetch('api/bookTicket.php', { method:'POST', body:… })
 *
 * While PHP is not connected, demo-data.js (loaded before this file) provides
 * DEMO_STATS and DEMO_TRAINS as fallback globals.
 */

// Production variables — populated by loadData()
let trains = [];
let stats  = {};

// ── Initialise on DOM ready ───────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
  loadData();
  document.getElementById('searchBtn').addEventListener('click', handleSearch);
  document.getElementById('bookBtn').addEventListener('click', handleBook);
});

// ── Data loader ───────────────────────────────────────────────────────────────
// When PHP is ready: replace the body of this function with two fetch() calls.
// The rendering functions (loadStats, loadTrainTable, loadTrainDropdown) stay
// exactly the same — only the data source changes.

function loadData() {
  // -- PHP version (uncomment and remove the fallback block below) --
  // Promise.all([
  //   fetch('api/getStats.php').then(r => r.json()),
  //   fetch('api/getTrains.php').then(r => r.json())
  // ]).then(function ([s, t]) {
  //   stats  = s;
  //   trains = t;
  //   renderAll();
  // });

  // -- Demo fallback (remove when PHP is connected) --
  stats  = (typeof DEMO_STATS  !== 'undefined') ? DEMO_STATS  : {};
  trains = (typeof DEMO_TRAINS !== 'undefined') ? DEMO_TRAINS : [];
  renderAll();
}

function renderAll() {
  loadStats();
  loadTrainTable(trains);
  loadTrainDropdown(trains);
}

// ── Stats ─────────────────────────────────────────────────────────────────────

function loadStats() {
  document.getElementById('totalTrains').textContent        = stats.totalTrains        ?? '—';
  document.getElementById('totalPassengers').textContent    = stats.totalPassengers    ?? '—';
  document.getElementById('totalTickets').textContent       = stats.totalTickets       ?? '—';
  document.getElementById('totalCancellations').textContent = stats.totalCancellations ?? '—';
}

// ── Train table ───────────────────────────────────────────────────────────────

function loadTrainTable(list) {
  const tbody = document.getElementById('trainTableBody');
  tbody.innerHTML = '';

  if (!list || list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:24px">No trains found for this route.</td></tr>';
    return;
  }

  list.forEach(function (t) {
    const seatBadge   = t.seats > 30 ? 'badge-green' : t.seats > 10 ? 'badge-amber' : 'badge-red';
    const statusBadge = t.status === 'On Time' ? 'badge-green' : 'badge-amber';
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${t.name}</strong><br><span style="color:var(--muted);font-size:.78rem">#${t.id}</span></td>
      <td>${t.source}</td>
      <td>${t.destination}</td>
      <td>${t.departure}</td>
      <td>${t.duration}</td>
      <td><span class="badge ${seatBadge}">${t.seats} seats</span></td>
      <td><span class="badge ${statusBadge}">● ${t.status}</span></td>
    `;
    tbody.appendChild(row);
  });
}

// ── Train dropdown — value = train ID for BookTicket stored procedure ─────────

function loadTrainDropdown(list) {
  const sel = document.getElementById('trainSelect');
  while (sel.options.length > 1) sel.remove(1);

  list.forEach(function (t) {
    const opt = document.createElement('option');
    opt.value       = t.id;   // train ID, not name — backend uses this
    opt.textContent = t.name;
    sel.appendChild(opt);
  });
}

// ── Search ────────────────────────────────────────────────────────────────────

function handleSearch() {
  const from = document.getElementById('fromInput').value.trim();
  const to   = document.getElementById('toInput').value.trim();
  const date = document.getElementById('dateInput').value;

  const errEl = document.getElementById('searchError');
  errEl.style.display = 'none';

  // Validation
  if (!from || !to) {
    showError(errEl, 'Please enter both From and To stations.');
    return;
  }
  if (from.toLowerCase() === to.toLowerCase()) {
    showError(errEl, 'Source and destination cannot be the same.');
    return;
  }
  if (date) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (new Date(date) < today) {
      showError(errEl, 'Travel date cannot be in the past.');
      return;
    }
  }

  // -- PHP version (uncomment and remove the demo block below) --
  // Remove e.preventDefault() from the form and let it submit to search.php,
  // OR use fetch() to get JSON and call loadTrainTable(results):
  // fetch(`api/search.php?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}`)
  //   .then(r => r.json())
  //   .then(function (results) {
  //     loadTrainTable(results);
  //     loadTrainDropdown(results);
  //     document.getElementById('trainResultsSubtitle').textContent =
  //       `Showing ${results.length} train(s): ${from} → ${to}`;
  //   });

  // -- Demo fallback (remove when PHP is connected) --
  const results = trains.filter(function (t) {
    return t.source.toLowerCase().includes(from.toLowerCase()) ||
           t.destination.toLowerCase().includes(to.toLowerCase());
  });
  loadTrainTable(results);
  loadTrainDropdown(results);
  document.getElementById('trainResultsSubtitle').textContent =
    `Showing ${results.length} train(s): ${from} → ${to}`;
}

// ── Booking ───────────────────────────────────────────────────────────────────

function handleBook() {
  const name    = document.getElementById('pname').value.trim();
  const phone   = document.getElementById('phone').value.trim();
  const trainId = document.getElementById('trainSelect').value;
  const cls     = document.getElementById('travelClass').value;

  const msgEl = document.getElementById('msg');
  const errEl = document.getElementById('bookError');
  msgEl.style.display = 'none';
  errEl.style.display = 'none';

  // Frontend validation (backend must also validate — never trust frontend alone)
  if (!name || !phone || !trainId || !cls) {
    showBookError('Please fill in all booking fields.');
    return;
  }
  if (!/^\d{10}$/.test(phone)) {
    showBookError('Phone number must be exactly 10 digits.');
    return;
  }

  // -- PHP version (uncomment and remove the demo block below) --
  // fetch('api/bookTicket.php', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ name, phone, trainId, cls })
  // })
  // .then(r => r.json())
  // .then(function (res) {
  //   document.getElementById('msgText').textContent =
  //     `Booking successful! Ticket ID: ${res.ticketId} · Seat: ${res.seat} · Train: ${res.trainName}`;
  //   msgEl.style.display = 'flex';
  //   setTimeout(() => { msgEl.style.display = 'none'; }, 6000);
  // });

  // -- Demo fallback (remove when PHP is connected) --
  const train = trains.find(t => String(t.id) === String(trainId));
  document.getElementById('msgText').textContent =
    `Booking successful! Passenger: ${name} · Train: ${train ? train.name : '#' + trainId} · Class: ${cls} · Seat assigned automatically by system.`;
  msgEl.style.display = 'flex';
  setTimeout(() => { msgEl.style.display = 'none'; }, 6000);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function showError(el, msg) {
  el.textContent = msg;
  el.style.display = 'block';
}

function showBookError(msg) {
  document.getElementById('bookErrorText').textContent = msg;
  document.getElementById('bookError').style.display = 'flex';
}
