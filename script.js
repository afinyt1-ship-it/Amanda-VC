const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzlOa4LiXwAyp2-anJnJyowu92Bsb4KLsjTFGpummhc9X_b87JJQBwbj2VlfNft9h0p/exec";

let currentStock = 30;

const pageLanding = document.getElementById('page-landing');
const pageForm = document.getElementById('page-form');
const btnToForm = document.getElementById('btn-to-form');

const stockDisplay = document.getElementById('ticket-stock');
const ticketForm = document.getElementById('ticket-form');
const sessionSelect = document.getElementById('session');
const qtySelect = document.getElementById('qty');
const submitBtn = document.getElementById('submit-btn');
const statusMessage = document.getElementById('status-message');

// Klik tombol BELI di Halaman 1 ➔ Pindah ke Halaman 2 (Form)
btnToForm.addEventListener('click', () => {
  pageLanding.classList.remove('active');
  pageForm.classList.add('active');
  fetchLatestStock();
});

// Ambil stok dari Google Sheets berdasarkan Sesi
function fetchLatestStock() {
  stockDisplay.textContent = "...";
  const selectedSession = sessionSelect.value;

  fetch(`${GOOGLE_SCRIPT_URL}?session=${encodeURIComponent(selectedSession)}`)
    .then(response => response.json())
    .then(data => {
      currentStock = data.stock;
      updateStockUI();
    })
    .catch(err => {
      console.error("Error fetching stock:", err);
      stockDisplay.textContent = "Error";
    });
}

// Saat user ganti Sesi di dropdown, update stok secara real-time
sessionSelect.addEventListener('change', fetchLatestStock);

function updateStockUI() {
  stockDisplay.textContent = currentStock;

  if (currentStock <= 0) {
    stockDisplay.textContent = "HABIS";
    stockDisplay.style.color = "#ef4444";
    submitBtn.disabled = true;
    submitBtn.textContent = "Tiket Sesi Ini Habis";
  } else {
    stockDisplay.style.color = "#38bdf8";
    submitBtn.disabled = false;
    submitBtn.textContent = "Beli Tiket Sekarang";
  }
}

ticketForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const requestedQty = parseInt(qtySelect.value);

  if (requestedQty > currentStock) {
    showMessage(`Gagal! Sisa tiket hanya ${currentStock}.`, 'error');
    return;
  }

  const formData = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    discord: document.getElementById('discord').value,
    session: sessionSelect.value,
    qty: requestedQty
  };

  submitBtn.disabled = true;
  submitBtn.textContent = "Mengirim Data...";

  fetch(GOOGLE_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify(formData)
  })
  .then(() => {
    showMessage(`Berhasil! ${requestedQty} tiket ${formData.session} dipesan.`, 'success');
    ticketForm.reset();
    setTimeout(fetchLatestStock, 1500);
  })
  .catch(error => {
    console.error('Error:', error);
    showMessage('Terjadi kesalahan saat mengirim data.', 'error');
    fetchLatestStock();
  });
});

function showMessage(msg, type) {
  statusMessage.textContent = msg;
  statusMessage.className = `message ${type}`;
}
