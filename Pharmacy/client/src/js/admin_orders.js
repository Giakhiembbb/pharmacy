// src/js/admin_orders.js
import { auth, db } from './firebase-config.js';
import { collection, getDocs, updateDoc, doc, where, query } from 'https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js';
import { checkSession } from './check-session.js';

// Lấy userSession từ localStorage
let userSession = JSON.parse(localStorage.getItem('user_session'));

// Kiểm tra phiên đăng nhập ngay lập tức
if (!checkSession()) {
  console.log("Phiên đăng nhập không hợp lệ, chuyển hướng...");
}

// Kiểm tra quyền khi DOM loaded
document.addEventListener('DOMContentLoaded', async () => {
  try {
    if (!userSession || !userSession.user || !userSession.user.email) {
      alert("Phiên đăng nhập không hợp lệ! Vui lòng đăng nhập lại.");
      window.location.href = "./index.html";
      return;
    }

    const email = userSession.user.email;
    console.log("Email dùng trong truy vấn:", email);
    if (typeof email !== 'string' || email.trim() === '') {
      throw new Error("Email không hợp lệ: " + JSON.stringify(email));
    }

    const q = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      alert("Không tìm thấy người dùng!");
      window.location.href = "./index.html";
      return;
    }

    let hasPermission = false;
    querySnapshot.forEach((doc) => {
      const user = doc.data();
      if (user.role_id === 1) {
        hasPermission = true;
      }
    });

    if (!hasPermission) {
      alert("Bạn không có quyền truy cập!");
      window.location.href = "./index.html";
      return;
    }

    await loadOrders();
  } catch (error) {
    console.error("Lỗi khi kiểm tra quyền truy cập:", error);
    alert("Có lỗi xảy ra khi kiểm tra quyền truy cập!");
    window.location.href = "./index.html";
  }
});

// Hàm tải danh sách đơn hàng
async function loadOrders() {
  try {
    const orderTableBody = document.getElementById('order-admin');
    let htmls = '';
    let index = 1;
    const querySnapshot = await getDocs(collection(db, 'orders'));

    if (querySnapshot.empty) {
      orderTableBody.innerHTML = '<tr><td colspan="5" class="text-center">Chưa có đơn hàng nào.</td></tr>';
      return;
    }

    querySnapshot.forEach((doc) => {
      const orderItem = doc.data();
      const orderId = doc.id;
      const totalPrice = (orderItem.product.price * parseInt(orderItem.quantity)).toLocaleString('vi-VN');

      htmls += `
        <tr class="product-item text-center">
          <th>${index}</th>
          <td>${orderItem.author || 'Khách vãng lai'}</td>
          <td>${orderItem.product.name}</td>
          <td>${totalPrice} VND</td>
          <td>
            <select class="slt-order-status" data-order-id="${orderId}">
              <option value="0" ${orderItem.status === 0 ? 'selected' : ''}>Chờ xác nhận</option>
              <option value="1" ${orderItem.status === 1 ? 'selected' : ''}>Chờ vận chuyển</option>
              <option value="2" ${orderItem.status === 2 ? 'selected' : ''}>Đã nhận hàng</option>
              <option value="3" ${orderItem.status === 3 ? 'selected' : ''}>Đã hủy</option>
            </select>
          </td>
        </tr>
      `;
      index++;
    });

    orderTableBody.innerHTML = htmls;

    // Thêm sự kiện thay đổi trạng thái
    document.querySelectorAll('.slt-order-status').forEach((selectElement) => {
      selectElement.addEventListener('change', async () => {
        const orderId = selectElement.getAttribute('data-order-id');
        const newStatus = parseInt(selectElement.value);

        try {
          await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
          alert('Cập nhật trạng thái thành công');
        } catch (error) {
          console.error("Lỗi khi cập nhật trạng thái:", error);
          alert("Có lỗi xảy ra khi cập nhật trạng thái!");
        }
      });
    });
  } catch (error) {
    console.error("Lỗi khi tải danh sách đơn hàng:", error);
    const orderTableBody = document.getElementById('order-admin');
    orderTableBody.innerHTML = '<tr><td colspan="5" class="text-center">Lỗi tải dữ liệu đơn hàng.</td></tr>';
  }
}

// Gọi hàm tải đơn hàng ngay lập tức
loadOrders();