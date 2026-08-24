const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzlOa4LiXwAyp2-anJnJyowu92Bsb4KLsjTFGpummhc9X_b87JJQBwbj2VlfNft9h0p/exec";

let currentStock = 0;

const stockDisplay = document.getElementById('ticket-stock');
const ticketForm = document.getElementById('ticket-form');
const qtySelect = document.getElementById('qty');
const submitBtn = document.getElementById('submit-btn');
const statusMessage = document.getElementById('status-message');

// Ambil stok paling update dari server Google Sheets
function fetchLatestStock() {
  stockDisplay.textContent = "...";

  fetch(GOOGLE_SCRIPT_URL)
    .then(response => response.json())
    .then(data => {
      currentStock = data.stock;
      updateStockUI();
    })
    .catch(err => {
      console.error("Gagal mengambil stok:", err);
      stockDisplay.textContent = "Error";
    });
}

function updateStockUI() {
  stockDisplay.textContent = currentStock;

  if (currentStock <= 0) {
    stockDisplay.textContent = "HABIS";
    stockDisplay.style.color = "#ef4444";
    submitBtn.disabled = true;
    submitBtn.textContent = "Tiket Habis";
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
    usdc: "-",
    qty: requestedQty
  };

  submitBtn.disabled = true;
  submitBtn.textContent = "Mengirim Data...";

  fetch(GOOGLE_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  })
  .then(() => {
    showMessage(`Berhasil! ${requestedQty} tiket berhasil dipesan.`, 'success');
    ticketForm.reset();

    // Beri jeda 1.5 detik lalu update angka stok terbaru dari Google Sheets
    setTimeout(fetchLatestStock, 1500);
  })
  .catch(error => {
    console.error('Error:', error);
    showMessage('Terjadi kesalahan saat mengirim data. Coba lagi.', 'error');
    fetchLatestStock();
  });
});

function showMessage(msg, type) {
  statusMessage.textContent = msg;
  statusMessage.className = `message ${type}`;
}

// Panggil stok saat web dibuka
fetchLatestStock();
