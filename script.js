const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzlOa4LiXwAyp2-anJnJyowu92Bsb4KLsjTFGpummhc9X_b87JJQBwbj2VlfNft9h0p/exec";

// Ambil stok dari LocalStorage browser. Jika belum ada, set awal = 20
let currentStock = localStorage.getItem('ticket_stock') 
  ? parseInt(localStorage.getItem('ticket_stock')) 
  : 20;

const stockDisplay = document.getElementById('ticket-stock');
const ticketForm = document.getElementById('ticket-form');
const qtySelect = document.getElementById('qty');
const submitBtn = document.getElementById('submit-btn');
const statusMessage = document.getElementById('status-message');

// Update Tampilan Stok di Web
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

  // Validasi stok
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

  // Kirim data pembeli ke Google Sheets
  fetch(GOOGLE_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  })
  .then(() => {
    // Kurangi stok dan simpan permanen di browser
    currentStock -= requestedQty;
    localStorage.setItem('ticket_stock', currentStock);
    
    updateStockUI();

    showMessage(`Berhasil! ${requestedQty} tiket berhasil dipesan. Data tersimpan di Google Sheets.`, 'success');
    ticketForm.reset();
  })
  .catch(error => {
    console.error('Error:', error);
    showMessage('Terjadi kesalahan saat mengirim data. Coba lagi.', 'error');
    updateStockUI();
  });
});

function showMessage(msg, type) {
  statusMessage.textContent = msg;
  statusMessage.className = `message ${type}`;
}

// Langsung tampilkan stok saat halaman dibuka
updateStockUI();