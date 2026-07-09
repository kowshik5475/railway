document.addEventListener('DOMContentLoaded', function () {

  // ── Search ────────────────────────────────────
  const searchBtn = document.getElementById('searchBtn');
  if (searchBtn) {
    searchBtn.addEventListener('click', searchTrains);
    document.getElementById('dateInput')?.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') searchTrains();
    });
  }

  // ── Booking ───────────────────────────────────
  const bookBtn = document.getElementById('bookBtn');
  if (bookBtn) {
    bookBtn.addEventListener('click', book);
  }

});

function searchTrains() {
  const from = document.getElementById('fromInput').value.trim();
  const to   = document.getElementById('toInput').value.trim();
  if (!from || !to) {
    alert('Please enter both From and To stations.');
    return;
  }
  // Update only the results panel subtitle (scoped by id)
  const subtitle = document.getElementById('trainResultsSubtitle');
  if (subtitle) subtitle.textContent = `Showing results: ${from} → ${to}`;
}

function book() {
  const name  = document.getElementById('pname').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const train = document.getElementById('trainSelect').value;
  const seat  = document.getElementById('seat').value.trim();

  if (!name || !phone || !train || !seat) {
    alert('Please fill in all booking fields.');
    return;
  }

  const msg     = document.getElementById('msg');
  const msgText = msg.querySelector('span:last-child');
  msgText.textContent =
    `Booking confirmed for ${name} on ${train}, Seat ${seat}. (Demo — frontend only)`;
  msg.classList.add('show');

  // Auto-hide after 5 seconds
  setTimeout(() => msg.classList.remove('show'), 5000);
}
