// Data keranjang - ambil dari localStorage atau array kosong
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Menu data untuk testing
const menuData = [
  {
    id: 1,
    name: "Nasi Kepal",
    price: 6000,
    category: "nasi-kepal",
    description: "Nasi kepal dengan isi Ayam Suwir Daun Jeruk Balado",
    image: "assets/images/nasi-kepal.jpg", // Hapus leading slash
  },
  {
    id: 2,
    name: "Kimbab",
    price: 6000,
    category: "kimbab",
    description: "Kimbab isi Ayam dan Sayuran",
    image: "assets/images/kimbab.jpg", // Hapus leading slash
  },
];

// Variabel untuk mengelola timeout notifikasi
let notificationTimeout = null;

// Simpan ke localStorage dengan error handling
function saveCart() {
  try {
    localStorage.setItem("cart", JSON.stringify(cart));
  } catch (error) {
    console.error("Error saving cart to localStorage:", error);
    showNotification("Gagal menyimpan keranjang", "error");
  }
}

// Tambah item ke keranjang
function addToCart(name, price) {
  if (!name || !price || price <= 0) {
    showNotification("Data item tidak valid", "error");
    return;
  }

  const existingItem = cart.find((item) => item.name === name);

  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({ name, price, qty: 1 });
  }

  saveCart();
  updateCartDisplay();
  showNotification("Item berhasil ditambahkan ke keranjang!");
}

// Update tampilan keranjang
function updateCartDisplay() {
  renderCart();
  updateCartCount();
}

// Render keranjang dengan error handling
function renderCart() {
  const cartItemsEl = document.getElementById("cart-items");
  const emptyCartEl = document.getElementById("empty-cart");
  const cartFooterEl = document.getElementById("cart-footer");

  if (!cartItemsEl) {
    console.warn("Cart items element not found");
    return;
  }

  // Hapus semua item hasil render sebelumnya, tapi biarkan #empty-cart tetap ada
  Array.from(cartItemsEl.children).forEach((child) => {
    if (child.id !== "empty-cart") cartItemsEl.removeChild(child);
  });

  if (cart.length === 0) {
    if (emptyCartEl) emptyCartEl.style.display = "block";
    if (cartFooterEl) cartFooterEl.classList.add("hidden");
    // Tidak perlu render item apapun
    return;
  }

  if (emptyCartEl) emptyCartEl.style.display = "none";
  if (cartFooterEl) cartFooterEl.classList.remove("hidden");

  let total = 0;
  let subtotalHtml = "";

  cart.forEach((item, index) => {
    if (!item || !item.name || !item.price || !item.qty) {
      console.warn("Invalid cart item:", item);
      return;
    }

    const itemTotal = item.price * item.qty;
    total += itemTotal;

    subtotalHtml += `
    <div class="flex justify-between items-center text-xs text-gray-700 mb-1">
      <span>${escapeHtml(item.name)} x${item.qty}</span>
      <span>Rp ${itemTotal.toLocaleString()}</span>
    </div>
  `;

    const itemEl = document.createElement("div");
    itemEl.className =
      "cart-item border border-gray-200 rounded-md pb-2 mb-2 px-2 py-2 bg-white"; // outline tiap item

    itemEl.innerHTML = `
  <div class="flex justify-between items-center gap-2">
    <div class="flex-1">
      <h4 class="font-semibold text-xs text-gray-800 mb-1">${escapeHtml(
        item.name
      )}</h4>
      <p class="text-xs text-gray-600">Rp ${item.price.toLocaleString()}</p>
    </div>
    <div class="flex items-center gap-1">
      <div class="flex items-center border border-gray-300 rounded px-1 py-0.5 bg-white"> <!-- outline tombol -->
        <button onclick="changeQty(${index}, -1)" class="quantity-btn text-gray-700 w-5 h-5 flex items-center justify-center text-xs" aria-label="Kurangi jumlah">−</button>
        <span class="mx-1 font-medium w-5 text-center text-xs">${
          item.qty
        }</span>
        <button onclick="changeQty(${index}, 1)" class="quantity-btn text-gray-700 w-5 h-5 flex items-center justify-center text-xs" aria-label="Tambah jumlah">+</button>
      </div>
      <button onclick="removeItem(${index})" class="ml-1 text-red-500 hover:text-red-700 w-5 h-5 rounded-full flex items-center justify-center text-xs" aria-label="Hapus item">×</button>
    </div>
  </div>
`;

    cartItemsEl.appendChild(itemEl);
  });

  // Tampilkan subtotal di atas total
  const cartFooter = document.getElementById("cart-footer");
  // ...existing code...
  if (cartFooter) {
    // Sisipkan subtotal sebelum total
    cartFooter.innerHTML =
      `<div class="mb-2 border-b pb-2">
      <div class="font-semibold text-xs text-gray-500 mb-1">Subtotal per item:</div>
      ${subtotalHtml}
    </div>` +
      `<div class="flex justify-between items-center text-base font-bold">
      <span>Total:</span>
      <span id="cart-total">Rp ${total.toLocaleString()}</span>
    </div>
    <div class="flex gap-2 mt-2">
      <button id="clear-cart" class="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors font-medium text-sm">
        <i data-feather="trash-2" class="w-4 h-4 inline mr-1"></i>
        Kosongkan
      </button>
      <button id="whatsapp-checkout" class="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors font-medium text-sm">
        <i class="bi bi-whatsapp w-4 h-4 inline mr-1"></i>
        WhatsApp
      </button>
    </div>
    <button id="cash-checkout" class="w-full mt-1 bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition-colors font-medium text-sm">
      <i class="bi bi-cash-stack w-4 h-4 inline mr-1"></i>
      Bayar Cash
    </button>`;

    // PASANG ULANG EVENT LISTENER SETELAH RENDER
    const clearCartBtn = document.getElementById("clear-cart");
    const whatsappBtn = document.getElementById("whatsapp-checkout");
    const cashBtn = document.getElementById("cash-checkout");

    if (clearCartBtn) clearCartBtn.addEventListener("click", clearCart);
    if (whatsappBtn) whatsappBtn.addEventListener("click", whatsappCheckout);
    if (cashBtn) cashBtn.addEventListener("click", openCashModal);
  }
  // ...existing code...
  // Update total
  const totalEl = document.getElementById("cart-total");
  if (totalEl) totalEl.innerText = `Rp ${total.toLocaleString()}`;
}
// Helper function untuk escape HTML
function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, function (m) {
    return map[m];
  });
}

// Update jumlah item di cart badge
function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + (item.qty || 0), 0);
  const cartCountEl = document.getElementById("cart-count");
  const mobileCartCountEl = document.getElementById("mobile-cart-count");

  if (cartCountEl) {
    cartCountEl.innerText = totalItems;
    cartCountEl.style.display = totalItems > 0 ? "flex" : "none";
  }

  if (mobileCartCountEl) {
    mobileCartCountEl.innerText = totalItems;
    mobileCartCountEl.style.display = totalItems > 0 ? "flex" : "none";
  }
}

// Ubah jumlah item dengan validasi
function changeQty(index, amount) {
  if (!cart[index] || typeof amount !== "number") {
    console.warn("Invalid changeQty parameters:", index, amount);
    return;
  }

  const oldQty = cart[index].qty;
  cart[index].qty += amount;

  if (cart[index].qty <= 0) {
    const itemName = cart[index].name;
    cart.splice(index, 1);
    showNotification(`${itemName} dihapus dari keranjang`, "warning");
  } else if (amount > 0) {
    showNotification("Jumlah item ditambah", "success");
  } else {
    showNotification("Jumlah item dikurangi", "warning");
  }

  saveCart();
  updateCartDisplay();
}

// Hapus item dengan validasi
function removeItem(index) {
  if (!cart[index]) {
    console.warn("Invalid removeItem index:", index);
    return;
  }

  const itemName = cart[index].name;
  cart.splice(index, 1);
  saveCart();
  updateCartDisplay();
  showNotification(`${itemName} berhasil dihapus dari keranjang`, "error");
}

// Kosongkan keranjang
function clearCart() {
  if (cart.length === 0) {
    showNotification("Keranjang sudah kosong", "warning");
    return;
  }

  cart = [];
  saveCart();
  updateCartDisplay();
  showNotification("Keranjang berhasil dikosongkan", "success");
}

// Tampilkan notifikasi dengan perbaikan
function showNotification(message, type = "success", duration = 3000) {
  if (!message) {
    console.warn("Notification message is empty");
    return;
  }

  // Hapus notifikasi yang sudah ada
  closeNotification();

  // Buat elemen notifikasi baru
  const notification = document.createElement("div");
  notification.id = "notification";

  // Set class berdasarkan type
  const typeConfig = {
    success: { bg: "bg-green-500", icon: "✓" },
    error: { bg: "bg-red-500", icon: "✗" },
    warning: { bg: "bg-yellow-500", icon: "⚠" },
    info: { bg: "bg-blue-500", icon: "ℹ" },
  };

  const config = typeConfig[type] || typeConfig.info;

  notification.className = `fixed bottom-4 right-4 z-50 px-6 py-4 rounded-lg shadow-xl text-white ${config.bg} 
                           transform translate-x-full transition-all duration-500 ease-in-out 
                           cursor-pointer hover:shadow-2xl flex items-center gap-3 max-w-sm`;

  notification.innerHTML = `
    <div class="flex items-center gap-3">
      <span class="text-xl font-bold">${config.icon}</span>
      <div>
        <span class="font-medium">${escapeHtml(message)}</span>
        <div class="text-xs opacity-80 mt-1">Klik untuk menutup</div>
      </div>
      <button class="close-notification-btn ml-auto text-white hover:text-gray-200 text-xl font-bold leading-none" aria-label="Tutup notifikasi">×</button>
    </div>
  `;

  // Tambahkan ke body
  document.body.appendChild(notification);

  // Event listener untuk close button
  const closeBtn = notification.querySelector(".close-notification-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeNotification();
    });
  }

  // Event listener untuk menutup dengan klik pada notifikasi
  notification.addEventListener("click", closeNotification);

  // Trigger animasi masuk
  requestAnimationFrame(() => {
    notification.style.transform = "translateX(0)";
  });

  // Auto hide setelah duration
  notificationTimeout = setTimeout(() => {
    hideNotification();
  }, duration);
}

// Sembunyikan notifikasi dengan animasi
function hideNotification() {
  const notification = document.getElementById("notification");
  if (notification) {
    notification.style.transform = "translateX(100%)";
    notification.style.opacity = "0";

    setTimeout(() => {
      if (notification && notification.parentNode) {
        notification.remove();
      }
    }, 500);
  }
}

// Tutup notifikasi manual
function closeNotification() {
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
    notificationTimeout = null;
  }
  hideNotification();
}

// Load menu items dengan error handling
function loadMenu() {
  const menuContainer = document.getElementById("menu-container");
  if (!menuContainer) {
    console.warn("Menu container not found");
    return;
  }

  menuContainer.innerHTML = "";

  if (!menuData || menuData.length === 0) {
    menuContainer.innerHTML =
      '<p class="text-center text-gray-500 col-span-full">Menu tidak tersedia</p>';
    return;
  }

  menuData.forEach((item) => {
    if (!item || !item.name || !item.price) {
      console.warn("Invalid menu item:", item);
      return;
    }

    const menuItem = document.createElement("div");
    menuItem.className = "bg-white rounded-xl shadow-lg overflow-hidden ";

    menuItem.innerHTML = `
      <img src="${escapeHtml(item.image || "assets/images/placeholder.jpg")}" 
           alt="${escapeHtml(item.name)}" 
           class="w-full h-48 object-cover hover:scale-105 transition-transform duration-500"
           onerror="this.src='assets/images/placeholder.jpg'">
      <div class="p-4">
  <h3 class="font-bold text-lg mb-2">${escapeHtml(item.name)}</h3>
  <p class="text-gray-500 text-sm mb-3">${escapeHtml(
    item.description || ""
  )}</p>
  <div class="flex items-center justify-between">
    <p class="text-gray-600 text-base font-semibold">Rp ${item.price.toLocaleString()}</p>
    <button onclick="addToCart('${escapeHtml(item.name)}', ${item.price})" 
      class="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-1 px-3 rounded-md text-sm transition-colors">
      + Keranjang
    </button>
  </div>
</div>
    `;

    menuContainer.appendChild(menuItem);
  });
}

// Filter menu berdasarkan kategori
function filterMenu(category) {
  const menuContainer = document.getElementById("menu-container");
  if (!menuContainer) return;

  menuContainer.innerHTML = "";

  const filteredItems =
    category === "all"
      ? menuData
      : menuData.filter((item) => item && item.category === category);

  if (filteredItems.length === 0) {
    menuContainer.innerHTML =
      '<p class="text-center text-gray-500 col-span-full">Tidak ada menu dalam kategori ini</p>';
    return;
  }

  filteredItems.forEach((item) => {
    if (!item || !item.name || !item.price) return;

    const menuItem = document.createElement("div");
    menuItem.className =
      "bg-white rounded-xl shadow-lg overflow-hidden hover:scale-105 transition-transform duration-300";

    menuItem.innerHTML = `
      <img src="${escapeHtml(item.image || "assets/images/placeholder.jpg")}" 
           alt="${escapeHtml(item.name)}" 
           class="w-full h-48 object-cover"
           onerror="this.src='assets/images/placeholder.jpg'">
      <div class="p-4">
        <h3 class="font-bold text-lg mb-2">${escapeHtml(item.name)}</h3>
        <p class="text-gray-600 mb-3">Rp ${item.price.toLocaleString()}</p>
        <button onclick="addToCart('${escapeHtml(item.name)}', ${item.price})" 
                class="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
          Tambah ke Keranjang
        </button>
      </div>
    `;

    menuContainer.appendChild(menuItem);
  });
}

// Checkout WhatsApp dengan validasi
function whatsappCheckout() {
  if (cart.length === 0) {
    showNotification("Keranjang masih kosong!", "error");
    return;
  }

  try {
    let message = "Halo, saya ingin memesan:\n\n";
    let total = 0;

    cart.forEach((item) => {
      if (item && item.name && item.price && item.qty) {
        const subtotal = item.price * item.qty;
        total += subtotal;
        message += `• ${item.qty}x ${
          item.name
        } - Rp ${subtotal.toLocaleString()}\n`;
      }
    });

    message += `\nTotal: Rp ${total.toLocaleString()}\n\nTerima kasih!`;

    const whatsappURL = `https://wa.me/6283862344516?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappURL, "_blank");

    showNotification("Pesanan dikirim ke WhatsApp!", "success");
  } catch (error) {
    console.error("Error creating WhatsApp message:", error);
    showNotification("Gagal membuat pesan WhatsApp", "error");
  }
}

// Modal functions
function openCashModal() {
  if (cart.length === 0) {
    showNotification("Keranjang masih kosong!", "error");
    return;
  }

  const cashModal = document.getElementById("cash-modal");
  if (cashModal) {
    cashModal.style.display = "flex";
    // Focus trap untuk accessibility
    const firstButton = cashModal.querySelector("button");
    if (firstButton) firstButton.focus();
  }
}

function closeCashModal() {
  const cashModal = document.getElementById("cash-modal");
  if (cashModal) {
    cashModal.style.display = "none";
  }
}

function confirmCashPayment() {
  showNotification(
    "Pesanan cash Anda telah dikonfirmasi! Silakan bayar saat pesanan diantar/diambil.",
    "success"
  );
  clearCart();
  closeCashModal();
}

// Initialize semua event listeners
function initializeEventListeners() {
  // Mobile menu toggle
  const menuToggle = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("nav-menu");

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("hidden");
    });
  }

  // Cart sidebar controls
  const openCartBtn = document.getElementById("open-cart");
  const mobileCartBtn = document.getElementById("mobile-cart-btn");
  const closeCartBtn = document.getElementById("close-cart");
  const cartSidebar = document.getElementById("cart-sidebar");

  if (openCartBtn && cartSidebar) {
    openCartBtn.addEventListener("click", () => {
      cartSidebar.classList.remove("translate-x-full");
    });
  }

  if (mobileCartBtn && cartSidebar) {
    mobileCartBtn.addEventListener("click", () => {
      cartSidebar.classList.remove("translate-x-full");
    });
  }

  if (closeCartBtn && cartSidebar) {
    closeCartBtn.addEventListener("click", () => {
      cartSidebar.classList.add("translate-x-full");
    });
  }

  // Cart action buttons
  const clearCartBtn = document.getElementById("clear-cart");
  const whatsappBtn = document.getElementById("whatsapp-checkout");
  const cashBtn = document.getElementById("cash-checkout");

  if (clearCartBtn) {
    clearCartBtn.addEventListener("click", clearCart);
  }

  if (whatsappBtn) {
    whatsappBtn.addEventListener("click", whatsappCheckout);
  }

  if (cashBtn) {
    cashBtn.addEventListener("click", openCashModal);
  }

  // Cash modal controls
  const cancelCash = document.getElementById("cancel-cash");
  const confirmCash = document.getElementById("confirm-cash");

  if (cancelCash) {
    cancelCash.addEventListener("click", closeCashModal);
  }

  if (confirmCash) {
    confirmCash.addEventListener("click", confirmCashPayment);
  }

  // Category filter buttons
  const categoryButtons = document.querySelectorAll(".category-filter");
  categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      categoryButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      const category = button.getAttribute("data-category");
      if (category) {
        filterMenu(category);
      }
    });
  });

  // Contact form
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      showNotification(
        "Pesan Anda telah terkirim! Kami akan segera menghubungi Anda."
      );
      contactForm.reset();
    });
  }

  // Smooth scrolling untuk link navigasi
  const navLinks = document.querySelectorAll('a[href^="#"]');
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href");
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

        if (navMenu) {
          navMenu.classList.add("hidden");
        }
      }
    });
  });

  // Keyboard event listeners
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeNotification();
      closeCashModal();

      if (cartSidebar && !cartSidebar.classList.contains("translate-x-full")) {
        cartSidebar.classList.add("translate-x-full");
      }
    }
  });

  // Click outside untuk menutup cart sidebar
  document.addEventListener("click", (e) => {
    if (cartSidebar && !cartSidebar.classList.contains("translate-x-full")) {
      const isClickOutside =
        !cartSidebar.contains(e.target) &&
        !openCartBtn?.contains(e.target) &&
        !mobileCartBtn?.contains(e.target);

      const isAddToCartButton = e.target.closest(
        'button[onclick*="addToCart"]'
      );
      const isCartActionButton =
        e.target.closest(".quantity-btn") ||
        e.target.closest('button[onclick*="changeQty"]') ||
        e.target.closest('button[onclick*="removeItem"]') ||
        e.target.closest('button[onclick*="clearCart"]');

      if (isClickOutside && !isAddToCartButton && !isCartActionButton) {
        cartSidebar.classList.add("translate-x-full");
      }
    }
  });

  // Click outside untuk menutup cash modal
  const cashModal = document.getElementById("cash-modal");
  if (cashModal) {
    cashModal.addEventListener("click", (e) => {
      if (e.target === cashModal) {
        closeCashModal();
      }
    });
  }
}

// Main initialization
document.addEventListener("DOMContentLoaded", function () {
  try {
    // Load menu dan update tampilan
    loadMenu();
    updateCartDisplay();

    // Initialize semua event listeners
    initializeEventListeners();

    // Initialize Feather icons jika tersedia
    if (typeof feather !== "undefined") {
      feather.replace();
    }

    console.log("Application initialized successfully");
  } catch (error) {
    console.error("Error initializing application:", error);
    showNotification("Terjadi kesalahan saat memuat aplikasi", "error");
  }
});

// Export functions untuk testing (opsional)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    addToCart,
    removeItem,
    clearCart,
    updateCartDisplay,
  };
}
