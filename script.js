// Data keranjang - ambil dari localStorage atau array kosong
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Menu data untuk testing
const menuData = [
  {
    id: 1,
    name: "Nasi Kepal Ayam Suwir",
    price: 6000,
    category: "nasi-kepal",
    image: "/assets/images/nasi-kepal.jpg",
  },
  {
    id: 2,
    name: "Kimbab",
    price: 6000,
    category: "kimbab",
    image: "/assets/images/kimbab.jpg",
  },
];

// Variabel untuk mengelola timeout notifikasi
let notificationTimeout = null;

// Simpan ke localStorage
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Tambah item ke keranjang
function addToCart(name, price) {
  const existingItem = cart.find((item) => item.name === name);

  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({ name, price, qty: 1 });
  }

  saveCart();
  updateCartDisplay();
  showNotification("Item berhasil ditambahkan ke keranjang!");

  // Jangan tutup cart sidebar - biarkan tetap terbuka jika sudah terbuka
}

// Update tampilan keranjang
function updateCartDisplay() {
  renderCart();
  updateCartCount();
}

// Render keranjang
function renderCart() {
  const cartItemsEl = document.getElementById("cart-items");
  const emptyCartEl = document.getElementById("empty-cart");
  const cartFooterEl = document.getElementById("cart-footer");

  if (!cartItemsEl) return;

  // Clear existing items
  cartItemsEl.innerHTML = "";

  if (cart.length === 0) {
    if (emptyCartEl) emptyCartEl.style.display = "block";
    if (cartFooterEl) cartFooterEl.classList.add("hidden");
    return;
  }

  if (emptyCartEl) emptyCartEl.style.display = "none";
  if (cartFooterEl) cartFooterEl.classList.remove("hidden");

  let total = 0;

  cart.forEach((item, index) => {
    const itemEl = document.createElement("div");
    itemEl.className = "cart-item border-b pb-4 mb-4";

    const itemTotal = item.price * item.qty;
    total += itemTotal;

    itemEl.innerHTML = `
      <div class="flex justify-between items-center">
        <div class="flex-1">
          <h4 class="font-semibold text-gray-800">${item.name}</h4>
          <p class="text-sm text-gray-600">Rp ${item.price.toLocaleString()}</p>
          <p class="text-sm font-medium text-yellow-600">Subtotal: Rp ${itemTotal.toLocaleString()}</p>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="changeQty(${index}, -1)" class="quantity-btn bg-gray-200 hover:bg-red-200 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center">−</button>
          <span class="mx-2 font-medium w-8 text-center">${item.qty}</span>
          <button onclick="changeQty(${index}, 1)" class="quantity-btn bg-gray-200 hover:bg-green-200 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center">+</button>
          <button onclick="removeItem(${index})" class="ml-2 text-red-500 hover:text-red-700 w-8 h-8 rounded-full flex items-center justify-center">×</button>
        </div>
      </div>
    `;

    cartItemsEl.appendChild(itemEl);
  });

  // Update total
  const totalEl = document.getElementById("cart-total");
  const qrisTotalEl = document.getElementById("qris-total");
  if (totalEl) totalEl.innerText = `Rp ${total.toLocaleString()}`;
  if (qrisTotalEl) qrisTotalEl.innerText = `Rp ${total.toLocaleString()}`;
}

// Update jumlah item di cart badge
function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
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

// Ubah jumlah item
function changeQty(index, amount) {
  if (!cart[index]) return;

  const oldQty = cart[index].qty;
  cart[index].qty += amount;

  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
    showNotification("Item dihapus dari keranjang", "warning");
  } else if (amount > 0) {
    showNotification("Jumlah item ditambah", "success");
  } else {
    showNotification("Jumlah item dikurangi", "warning");
  }

  saveCart();
  updateCartDisplay();

  // Cart sidebar tetap terbuka - tidak ada perintah untuk menutup
}

// Hapus item
function removeItem(index) {
  if (!cart[index]) return;

  const itemName = cart[index].name;
  cart.splice(index, 1);
  saveCart();
  updateCartDisplay();
  showNotification(`${itemName} berhasil dihapus dari keranjang`, "error");

  // Cart sidebar tetap terbuka - tidak ada perintah untuk menutup
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

  // Cart sidebar tetap terbuka - pengguna mungkin ingin menambah item lagi
}

// Tampilkan notifikasi - POSISI KANAN BAWAH DENGAN ANIMASI SMOOTH
function showNotification(message, type = "success", duration = 3000) {
  // Hapus notifikasi yang sudah ada
  const existingNotification = document.getElementById("notification");
  if (existingNotification) {
    existingNotification.remove();
  }

  // Clear timeout sebelumnya jika ada
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }

  // Buat elemen notifikasi baru
  const notification = document.createElement("div");
  notification.id = "notification";

  // Set class berdasarkan type
  const bgColor =
    type === "success"
      ? "bg-green-500"
      : type === "error"
      ? "bg-red-500"
      : type === "warning"
      ? "bg-yellow-500"
      : "bg-blue-500";

  notification.className = `fixed bottom-4 right-4 z-50 px-6 py-4 rounded-lg shadow-xl text-white ${bgColor} 
                           transform translate-x-full transition-all duration-500 ease-in-out 
                           cursor-pointer hover:shadow-2xl flex items-center gap-3 max-w-sm`;

  // Tambahkan icon berdasarkan type
  const icon =
    type === "success"
      ? "✓"
      : type === "error"
      ? "✗"
      : type === "warning"
      ? "⚠"
      : "ℹ";

  notification.innerHTML = `
    <div class="flex items-center gap-3">
      <span class="text-xl font-bold">${icon}</span>
      <div>
        <span class="font-medium">${message}</span>
        <div class="text-xs opacity-80 mt-1">Klik untuk menutup</div>
      </div>
      <button onclick="closeNotification()" class="ml-auto text-white hover:text-gray-200 text-xl font-bold leading-none">×</button>
    </div>
  `;

  // Tambahkan ke body
  document.body.appendChild(notification);

  console.log("Notification created:", message);

  // Trigger animasi masuk setelah elemen ditambahkan ke DOM
  setTimeout(() => {
    notification.style.transform = "translateX(0)";
    console.log("Notification animated in");
  }, 50);

  // Event listener untuk menutup dengan klik
  notification.addEventListener("click", closeNotification);

  // Auto hide setelah duration
  notificationTimeout = setTimeout(() => {
    console.log("Auto hiding notification");
    hideNotification();
  }, duration);
}

// Sembunyikan notifikasi dengan animasi smooth
function hideNotification() {
  const notification = document.getElementById("notification");
  if (notification) {
    console.log("Hiding notification with animation");

    // Animasi keluar ke kanan
    notification.style.transform = "translateX(100%)";
    notification.style.opacity = "0";

    // Hapus elemen setelah animasi selesai
    setTimeout(() => {
      if (notification && notification.parentNode) {
        notification.remove();
        console.log("Notification removed from DOM");
      }
    }, 500);
  }
}

// Tutup notifikasi manual
function closeNotification() {
  console.log("Manual close notification");
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
    notificationTimeout = null;
  }
  hideNotification();
}

// Fungsi sederhana untuk test notifikasi
function testNotification() {
  showNotification("Test notification - ini akan hilang dalam 3 detik!");
}

// Load menu items
function loadMenu() {
  const menuContainer = document.getElementById("menu-container");
  if (!menuContainer) return;

  menuContainer.innerHTML = "";

  menuData.forEach((item) => {
    const menuItem = document.createElement("div");
    menuItem.className =
      "bg-white rounded-xl shadow-lg overflow-hidden hover:scale-105 transition-transform duration-300";

    menuItem.innerHTML = `
      <img src="${item.image}" alt="${
      item.name
    }" class="w-full h-48 object-cover">
      <div class="p-4">
        <h3 class="font-bold text-lg mb-2">${item.name}</h3>
        <p class="text-gray-600 mb-3">Rp ${item.price.toLocaleString()}</p>
        <button onclick="addToCart('${item.name}', ${item.price})" 
                class="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
          Tambah ke Keranjang
        </button>
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
      : menuData.filter((item) => item.category === category);

  filteredItems.forEach((item) => {
    const menuItem = document.createElement("div");
    menuItem.className =
      "bg-white rounded-xl shadow-lg overflow-hidden hover:scale-105 transition-transform duration-300";

    menuItem.innerHTML = `
      <img src="${item.image}" alt="${
      item.name
    }" class="w-full h-48 object-cover">
      <div class="p-4">
        <h3 class="font-bold text-lg mb-2">${item.name}</h3>
        <p class="text-gray-600 mb-3">Rp ${item.price.toLocaleString()}</p>
        <button onclick="addToCart('${item.name}', ${item.price})" 
                class="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
          Tambah ke Keranjang
        </button>
      </div>
    `;

    menuContainer.appendChild(menuItem);
  });
}

// Checkout WhatsApp
function whatsappCheckout() {
  if (cart.length === 0) {
    showNotification("Keranjang masih kosong!", "error");
    return;
  }

  let message = "Halo, saya ingin memesan:\n\n";
  let total = 0;

  cart.forEach((item) => {
    const subtotal = item.price * item.qty;
    total += subtotal;
    message += `• ${item.qty}x ${
      item.name
    } - Rp ${subtotal.toLocaleString()}\n`;
  });

  message += `\nTotal: Rp ${total.toLocaleString()}\n\nTerima kasih!`;

  const whatsappURL = `https://wa.me/62895365232815?text=${encodeURIComponent(
    message
  )}`;
  window.open(whatsappURL, "_blank");
}

// QRIS Checkout
function qrisCheckout() {
  if (cart.length === 0) {
    showNotification("Keranjang masih kosong!", "error");
    return;
  }

  const qrisModal = document.getElementById("qris-modal");
  if (qrisModal) {
    qrisModal.classList.remove("hidden");
    qrisModal.classList.add("flex");
  }
}

// Tutup QRIS Modal
function closeQrisModal() {
  const qrisModal = document.getElementById("qris-modal");
  if (qrisModal) {
    qrisModal.classList.add("hidden");
    qrisModal.classList.remove("flex");
  }
}

// Konfirmasi pembayaran
function confirmPayment() {
  showNotification("Pembayaran berhasil!", "success");
  clearCart();
  closeQrisModal();
}

// Event listeners
document.addEventListener("DOMContentLoaded", function () {
  // Load menu saat halaman dimuat
  loadMenu();

  // Update tampilan keranjang saat halaman dimuat
  updateCartDisplay();

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
  const qrisBtn = document.getElementById("qris-checkout");

  if (clearCartBtn) {
    clearCartBtn.addEventListener("click", clearCart);
  }

  if (whatsappBtn) {
    whatsappBtn.addEventListener("click", whatsappCheckout);
  }

  if (qrisBtn) {
    qrisBtn.addEventListener("click", qrisCheckout);
  }

  // QRIS modal controls
  const closeQrisBtn = document.getElementById("close-qris");
  const confirmPaymentBtn = document.getElementById("confirm-payment");

  if (closeQrisBtn) {
    closeQrisBtn.addEventListener("click", closeQrisModal);
  }

  if (confirmPaymentBtn) {
    confirmPaymentBtn.addEventListener("click", confirmPayment);
  }

  // Category filter buttons
  const categoryButtons = document.querySelectorAll(".category-filter");
  categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remove active class from all buttons
      categoryButtons.forEach((btn) => btn.classList.remove("active"));

      // Add active class to clicked button
      button.classList.add("active");

      // Filter menu
      const category = button.getAttribute("data-category");
      filterMenu(category);
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

        // Tutup menu mobile setelah klik
        if (navMenu) {
          navMenu.classList.add("hidden");
        }
      }
    });
  });

  // Event listener untuk menutup notifikasi dengan tombol ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeNotification();

      // Tutup modal QRIS jika terbuka
      const qrisModal = document.getElementById("qris-modal");
      if (qrisModal && !qrisModal.classList.contains("hidden")) {
        closeQrisModal();
      }

      // Tutup cart sidebar jika terbuka - HANYA DENGAN ESC
      if (cartSidebar && !cartSidebar.classList.contains("translate-x-full")) {
        cartSidebar.classList.add("translate-x-full");
      }
    }
  });

  // Click outside untuk menutup cart sidebar - HANYA TUTUP SAAT CLICK OUTSIDE
  document.addEventListener("click", (e) => {
    if (cartSidebar && !cartSidebar.classList.contains("translate-x-full")) {
      // Cek apakah click berada di luar sidebar dan bukan tombol pembuka
      // Juga pastikan bukan tombol-tombol dalam sidebar (add, remove, quantity)
      const isClickOutside =
        !cartSidebar.contains(e.target) &&
        !openCartBtn?.contains(e.target) &&
        !mobileCartBtn?.contains(e.target);

      // Jangan tutup jika click pada tombol "Tambah ke Keranjang" di menu
      const isAddToCartButton = e.target.closest(
        'button[onclick*="addToCart"]'
      );

      // Jangan tutup jika click pada tombol quantity atau remove dalam cart
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

  // Click outside untuk menutup QRIS modal
  const qrisModal = document.getElementById("qris-modal");
  if (qrisModal) {
    qrisModal.addEventListener("click", (e) => {
      if (e.target === qrisModal) {
        closeQrisModal();
      }
    });
  }
});

// Initialize Feather icons jika sudah dimuat
if (typeof feather !== "undefined") {
  feather.replace();
}
