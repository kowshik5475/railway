/**
 * admin.js — production logic for admin.html
 *
 * Data sources (swap these when connecting PHP):
 *   Analytics      → fetch('api/getAnalytics.php')
 *   Activity log   → fetch('api/getActivity.php')
 *   Object browser → fetch('api/getAdminObjects.php?object=Trains')
 *
 * While PHP is not connected, demo-admin.js (loaded before this file) provides
 * DEMO_OBJECTS, DEMO_ANALYTICS, and DEMO_ACTIVITY as fallback globals.
 */

// Production variables — populated by loadAdminData()
let dbObjects  = {};
let analytics  = {};
let activity   = [];

// ── Initialise on DOM ready ───────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
  loadAdminData();
  initObjectBrowser();
});

// ── Data loader ───────────────────────────────────────────────────────────────
// When PHP is ready: replace the body of this function with fetch() calls.
// The rendering functions stay exactly the same — only the data source changes.

function loadAdminData() {
  // -- PHP version (uncomment and remove the fallback block below) --
  // Promise.all([
  //   fetch('api/getAnalytics.php').then(r => r.json()),
  //   fetch('api/getActivity.php').then(r => r.json())
  // ]).then(function ([a, act]) {
  //   analytics = a;
  //   activity  = act;
  //   loadAnalytics();
  //   loadActivityTable();
  // });

  // -- Demo fallback (remove when PHP is connected) --
  analytics = (typeof DEMO_ANALYTICS !== 'undefined') ? DEMO_ANALYTICS : {};
  activity  = (typeof DEMO_ACTIVITY  !== 'undefined') ? DEMO_ACTIVITY  : [];
  dbObjects = (typeof DEMO_OBJECTS   !== 'undefined') ? DEMO_OBJECTS   : {};
  loadAnalytics();
  loadActivityTable();
}

// ── Analytics ─────────────────────────────────────────────────────────────────

function loadAnalytics() {
  document.getElementById('occRate').textContent       = (analytics.occRate       ?? '—') + (analytics.occRate       != null ? '%' : '');
  document.getElementById('topTrainScore').textContent = (analytics.topTrainScore ?? '—') + (analytics.topTrainScore != null ? '%' : '');
  document.getElementById('cancelRate').textContent    = (analytics.cancelRate    ?? '—') + (analytics.cancelRate    != null ? '%' : '');

  setTimeout(function () {
    document.getElementById('occBar').style.width      = (analytics.occRate       || 0) + '%';
    document.getElementById('topTrainBar').style.width = (analytics.topTrainScore || 0) + '%';
    document.getElementById('cancelBar').style.width   = (analytics.cancelRate    || 0) + '%';
  }, 120);
}

// ── Activity table ────────────────────────────────────────────────────────────

function loadActivityTable() {
  const tbody = document.getElementById('activityTableBody');
  tbody.innerHTML = '';
  activity.forEach(function (row) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.event}</td>
      <td>${row.train}</td>
      <td>${row.passenger}</td>
      <td>${row.time}</td>
      <td><span class="badge ${row.badge}">${row.status}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

// ── Object browser ────────────────────────────────────────────────────────────

function initObjectBrowser() {
  document.querySelectorAll('.db-object-item').forEach(function (item) {
    item.addEventListener('click', function () {
      document.querySelectorAll('.db-object-item').forEach(el => el.classList.remove('active'));
      item.classList.add('active');

      const key  = item.getAttribute('data-object');
      const type = item.getAttribute('data-type');

      // -- PHP version (uncomment and remove the demo block below) --
      // fetch(`api/getAdminObjects.php?object=${encodeURIComponent(key)}`)
      //   .then(r => r.json())
      //   .then(obj => showObjectViewer(item.textContent.trim(), type, obj));

      // -- Demo fallback (remove when PHP is connected) --
      const obj = dbObjects[key];
      if (!obj) return;
      showObjectViewer(item.textContent.trim(), type, obj);
    });
  });
}

function showObjectViewer(label, type, obj) {
  const subtitle    = document.getElementById('objectViewerSubtitle');
  const badge       = document.getElementById('objectViewerBadge');
  const placeholder = document.getElementById('objectViewerPlaceholder');
  const tableView   = document.getElementById('objectViewerTable');
  const defView     = document.getElementById('objectViewerDef');

  const typeLabels = { table: 'Table', view: 'View', procedure: 'Procedure', trigger: 'Trigger' };
  subtitle.textContent = label;
  badge.textContent    = typeLabels[type] || type;
  badge.style.display  = 'inline-flex';
  placeholder.style.display = 'none';

  if (obj.type === 'table' || obj.type === 'view') {
    defView.style.display   = 'none';
    tableView.style.display = 'block';

    document.getElementById('selectedObjectThead').innerHTML =
      '<tr>' + obj.columns.map(c => `<th>${c}</th>`).join('') + '</tr>';

    const tbody = document.getElementById('selectedObjectTbody');
    tbody.innerHTML = '';
    if (!obj.rows || obj.rows.length === 0) {
      tbody.innerHTML = `<tr><td colspan="${obj.columns.length}" style="text-align:center;color:var(--muted);padding:20px">No records.</td></tr>`;
    } else {
      obj.rows.forEach(function (row) {
        const tr = document.createElement('tr');
        tr.innerHTML = row.map(cell => `<td>${cell}</td>`).join('');
        tbody.appendChild(tr);
      });
    }
  } else {
    tableView.style.display = 'none';
    defView.style.display   = 'block';
    document.getElementById('objectDefPre').textContent = obj.definition;
  }
}
