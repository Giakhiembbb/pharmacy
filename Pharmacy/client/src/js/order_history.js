// src/js/order.js
import { auth, db } from './firebase-config.js';
import { collection, query, where, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";
import { checkSession } from './check-session.js';

// Lấy userSession từ localStorage
let userSession = JSON.parse(localStorage.getItem('user_session'));

// Kiểm tra phiên đăng nhập ngay lập tức
if (!checkSession()) {
  console.log("Phiên đăng nhập không hợp lệ, chuyển hướng...");
}

// Hàm lấy danh sách đơn hàng
async function getOrderList() {
  try {
    if (!userSession || !userSession.user || !userSession.user.email) {
      document.querySelector('.order-list').innerHTML = '<p class="text-center">Vui lòng đăng nhập để xem lịch sử đơn hàng.</p>';
      return;
    }

    const authorEmail = userSession.user.email;
    let htmls = "";
    const q = query(collection(db, "orders"), where("author", "==", authorEmail));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      htmls = '<p class="text-center">Bạn chưa có đơn hàng nào.</p>';
    } else {
      querySnapshot.forEach((doc) => {
        const orderItem = doc.data();
        const createdAt = orderItem.createdAt.toDate().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
        const totalPrice = (orderItem.product.price * orderItem.quantity).toLocaleString('vi-VN');
        let statusString = orderItem.status === 0 ? "Chờ xác nhận" :
                          orderItem.status === 1 ? "Chờ vận chuyển" :
                          orderItem.status === 2 ? "Đã nhận hàng" : "Đã hủy";
        let cancelButton = orderItem.status === 0 ?
          `<button class="btn btn-danger btn-cancel rounded-sm" data-order-id="${doc.id}" data-order-price="${orderItem.product.price * orderItem.quantity}">Hủy đơn</button>` : "";

        htmls += `
          <div class="order-item shadow-md mt-2 p-2">
            <div class="d-flex align-items-center">
              <img class="rounded-md" src="${orderItem.product.imageUrl}" alt="${orderItem.product.name}" style="width: 100px; height: 100px;">
              <div class="content p-2 flex-grow-1">
                <h6>${orderItem.product.name}</h6>
                <p>Tổng tiền: ${totalPrice} VND</p>
                <p>Ngày đặt: ${createdAt}</p>
                <p>Trạng thái: <i>${statusString}</i></p>
              </div>
              <div class="actions">${cancelButton}</div>
            </div>
          </div>
        `;
      });
    }

    document.querySelector('.order-list').innerHTML = htmls;

    // Thêm sự kiện hủy đơn
    document.querySelectorAll('.btn-cancel').forEach((button) => {
      button.addEventListener('click', async () => {
        const orderId = button.getAttribute('data-order-id');
        const orderPrice = parseFloat(button.getAttribute('data-order-price'));

        if (confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
          try {
            await updateDoc(doc(db, "orders", orderId), { status: 3 });
            const userQuery = query(collection(db, "users"), where("email", "==", authorEmail));
            const userSnapshot = await getDocs(userQuery);
            const userDoc = userSnapshot.docs[0];
            const newBalance = (userDoc.data().balance || 0) + orderPrice;
            await updateDoc(doc(db, "users", userDoc.id), { balance: newBalance });
            alert("Hủy đơn hàng thành công!");
            await getOrderList();
          } catch (error) {
            console.error("Lỗi khi hủy đơn hàng:", error);
            alert("Có lỗi xảy ra khi hủy đơn hàng!");
          }
        }
      });
    });
  } catch (error) {
    console.error("Lỗi khi tải danh sách đơn hàng:", error);
    document.querySelector('.order-list').innerHTML = '<p class="text-center text-danger">Lỗi tải danh sách đơn hàng.</p>';
  }
}


// Gọi hàm tải danh sách đơn hàng khi trang tải
document.addEventListener('DOMContentLoaded', () => {
  getOrderList();
});