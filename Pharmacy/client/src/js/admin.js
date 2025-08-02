// src/js/admin.js
import { auth, db } from './firebase-config.js';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  where
} from 'https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js';
import { checkSession } from './check-session.js';

let userSession = JSON.parse(localStorage.getItem('user_session'));
checkSession();

document.addEventListener('DOMContentLoaded', async () => {
  try {
    if (!userSession) {
      alert("Vui lòng đăng nhập để truy cập!");
      window.location.href = "./index.html";
      return;
    }

    const email = userSession.user.email;
    const q = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      alert("Không tìm thấy người dùng!");
      window.location.href = "./index.html";
      return;
    }

    querySnapshot.forEach((doc) => {
      const user = doc.data();
      if (user.role_id !== 1) {
        alert("Bạn không có quyền truy cập!");
        window.location.href = "./index.html";
      }
    });

    await loadProducts();
  } catch (error) {
    console.error("Lỗi khi kiểm tra quyền truy cập:", error);
    alert("Có lỗi xảy ra khi kiểm tra quyền truy cập!");
  }
});


// Thêm sản phẩm 
document.getElementById('data-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const productName = document.getElementById("data-name").value;
  const productPrice = document.getElementById("data-price").value;
  const productImage = document.getElementById("data-image").files[0];

  if (!productName || !productPrice || !productImage) {
    alert("Vui lòng điền đầy đủ thông tin!");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("image", productImage);

    const response = await fetch("http://localhost:3000/upload", { 
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    console.log(result)
    
    if (!result.data?.secure_url) {
      throw new Error("Upload ảnh thất bại!");
    }

    await addDoc(collection(db, "products"), {
      name: productName,
      price: parseFloat(productPrice),
      imageUrl: result.data.secure_url,
      createdAt: serverTimestamp(),
    });

    alert("Thêm sản phẩm thành công!");
    document.getElementById("product-form").reset();
    await loadProducts();
  } catch (error) {
    console.error("Lỗi khi thêm sản phẩm:", error);
    alert("Có lỗi xảy ra khi thêm sản phẩm!");
  }
});



async function loadProducts() {
  try {
    const productTable = document.querySelector("product-list");
    let htmls = "";
    let index =1 ;
    const querySnapshot = await getDocs(collection(db, "products"));

    querySnapshot.forEach((doc) => {
      const product = doc.data();
      htmls += `
        <tr>
          <th>${index}</th>
          <td>${product.name}</td>
          <td>${product.type || ''}</td>
          <td>${product.price?.toLocaleString('vi-VN')}</td>
          <td>${product.quantity || 0}</td>
        </tr>
      `;
    });

    productTable.innerHTML = htmls;
  } catch (error) {
    console.error("Lỗi khi tải danh sách thuốc:", error);
  }
}
