import { auth, db } from './firebase-config.js';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js';

import { checkSession } from './check-session.js';

let userSession = JSON.parse(localStorage.getItem('user_session'));

// Kiểm tra phiên đăng nhập
// if (!checkSession()) {
//   console.log("Phiên đăng nhập không hợp lệ, chuyển hướng...");
//   window.location.href = "/login.html"; // hoặc đường dẫn trang đăng nhập của bạn
// } else {
//   document.addEventListener('DOMContentLoaded', () => {
//     loadBalance();
//     loadTransactionHistory();
//   });
// }

// Định dạng số tiền
function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Tải số dư từ Firestore
async function loadBalance() {
  const balanceElement = document.querySelector('.balance-number');
  const lastUpdatedElement = document.getElementById('last-updated');

  if (!balanceElement) return;

  if (!userSession || !userSession.user || !userSession.user.email) {
    balanceElement.textContent = 'Vui lòng đăng nhập';
    return;
  }

  try {
    const email = userSession.user.email;
    const q = query(collection(db, 'users'), where('email', '==', email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      balanceElement.textContent = 'Không tìm thấy thông tin người dùng';
      return;
    }

    const userDoc = snapshot.docs[0];
    const balance = userDoc.data().balance || 0;
    balanceElement.textContent = formatCurrency(balance);

    if (lastUpdatedElement) {
      lastUpdatedElement.textContent = new Date().toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
      });
    }
  } catch (error) {
    console.error('Lỗi khi tải số dư:', error);
    balanceElement.textContent = 'Lỗi tải số dư';
  }
}

// Tải lịch sử giao dịch
async function loadTransactionHistory() {
  const list = document.querySelector('.transaction-list');
  if (!list) return;

  if (!userSession || !userSession.user || !userSession.user.email) {
    list.innerHTML = '<p class="text-danger text-center">Vui lòng đăng nhập để xem lịch sử giao dịch.</p>';
    return;
  }

  try {
    const email = userSession.user.email;
    const q = query(collection(db, 'transactions'), where('userEmail', '==', email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      list.innerHTML = '<p class="text-muted text-center">Chưa có giao dịch nào.</p>';
      return;
    }

    let html = '';
    snapshot.forEach((doc) => {
      const t = doc.data();
      const date = t.timestamp?.toDate().toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
      }) || 'Không rõ thời gian';
      const amount = formatCurrency(t.amount);
      html += `
        <div class="transaction-item d-flex justify-content-between">
          <span>${t.type === 'deposit' ? 'Nạp tiền' : 'Thanh toán'} - ${t.bank || 'Ví'}</span>
          <span class="amount text-${t.type === 'deposit' ? 'success' : 'danger'}">${amount}</span>
          <span>${date}</span>
        </div>
      `;
    });
    list.innerHTML = html;
  } catch (error) {
    console.error('Lỗi khi tải lịch sử giao dịch:', error);
    list.innerHTML = '<p class="text-danger text-center">Không thể tải lịch sử giao dịch.</p>';
  }
}

// Xử lý nạp tiền
const form = document.querySelector('#balance-form');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const card = document.querySelector('#card-number').value;
    const bank = document.querySelector('#bank-select').value;
    const amount = parseFloat(document.querySelector('#amount').value);

    if (!card || !bank || isNaN(amount) || amount < 10000) {
      alert('Vui lòng nhập đầy đủ thông tin (tối thiểu 10.000 VND)');
      return;
    }

    try {
      const email = userSession.user.email;
      const q = query(collection(db, 'users'), where('email', '==', email));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        alert('Không tìm thấy người dùng!');
        return;
      }

      const userDoc = snapshot.docs[0];
      const oldBalance = userDoc.data().balance || 0;
      const newBalance = oldBalance + amount;

      await updateDoc(doc(db, 'users', userDoc.id), { balance: newBalance });

      await addDoc(collection(db, 'transactions'), {
        userEmail: email,
        type: 'deposit',
        amount: amount,
        bank: bank,
        timestamp: serverTimestamp(),
      });

      alert('Nạp tiền thành công!');
      const balanceElement = document.querySelector('.balance-number');
      if (balanceElement) {
        balanceElement.textContent = formatCurrency(newBalance);
      }
      form.reset();
      loadTransactionHistory();
    } catch (err) {
      console.error('Lỗi khi nạp tiền:', err);
      alert('Đã xảy ra lỗi khi nạp tiền!');
    }
  });
}
