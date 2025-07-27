// src/js/main.js => Sử dụng cho nhiều trang khác nhau
import { auth } from './firebase-config.js';
import { signOut } from 'https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js';

// Lấy userSession từ localStorage
const userSession = JSON.parse(localStorage.getItem('user_session'));

// Xử lý profile dropdown
document.addEventListener('DOMContentLoaded', () => {
  const profileDropdown = document.querySelector('#author-menu-drd');

  if (userSession) {
    const now = new Date().getTime();
    if (now < userSession.expiry) {
      // Cập nhật dropdown khi người dùng đã đăng nhập
      profileDropdown.innerHTML = `
        <li class="bg-grey-light"><span class="dropdown-item">${userSession.user.email}</span></li>
        <li><a class="dropdown-item" href="./order_history.html">Lịch sử đơn hàng</a></li>
        <li><a class="dropdown-item" href="./wallet.html">Ví</a></li>
        <li><button id="logout-btn" class="btn text-danger w-100 text-start">Đăng xuất</button></li>
      `;

      // Xử lý đăng xuất
      document.getElementById('logout-btn').addEventListener('click', () => {
        if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
          signOut(auth)
            .then(() => {
              localStorage.removeItem('user_session');
              window.location.href = "./index.html";
            })
            .catch((error) => {
              console.error("Lỗi khi đăng xuất:", error);
              alert("Có lỗi xảy ra khi đăng xuất!");
            });
        }
      });
    } else {
      // Xóa session nếu hết hạn
      localStorage.removeItem('user_session');
      console.log("Phiên đăng nhập đã hết hạn!");
    }
  } else {
    // Giữ nguyên dropdown mặc định cho khách chưa đăng nhập
    profileDropdown.innerHTML = `
      <li><a class="dropdown-item" href="./login.html">Đăng nhập</a></li>
      <li><a class="dropdown-item" href="./register.html">Đăng ký</a></li>
    `;
  }
});