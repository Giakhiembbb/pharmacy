// src/js/admin.js
import { auth, db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";
import { checkSession } from "./check-session.js";

let userSession = JSON.parse(localStorage.getItem("user_session"));
checkSession();

document.addEventListener("DOMContentLoaded", async () => {
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
document
  .getElementById("data-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const productName = document.getElementById("data-name").value;
    const productPrice = document.getElementById("data-price").value;
    const productImage = document.getElementById("data-image").files[0];
    const productDescription =document.getElementById("data-description").value;
    const productProducer =document.getElementById("data-producer").value;
    const productShape =document.getElementById("data-shape").value;
    const productDosage = document.getElementById("data-dosage").value;
    const productPackaging = document.getElementById("data-packaging").value;
    const productSideEffects =document.getElementById("data-sideEffects").value;
    const productUses = document.getElementById("data-uses").value;
    // them 12 truong

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
      console.log(result);

      if (!result.data?.secure_url) {
        throw new Error("Upload ảnh thất bại!");
      }
      const productData = {
        name: productName,
        price: parseFloat(productPrice),
        imageUrl: result.data.secure_url,
        createdAt: serverTimestamp(),

        description: productDescription,
        producer: productProducer,
        shape: productShape,
        dosage: productDosage,

       
        packaging: productPackaging,
        sideEffects: productSideEffects,
        uses: productUses,
      };
      console.log(productData);

      await addDoc(collection(db, "product"), {
        name: productName,
        price: parseFloat(productPrice),
        imageUrl: result.data.secure_url,
        createdAt: serverTimestamp(),
       producer: productProducer,
        shape: productShape,
        dosage: productDosage,
        description: productDescription,
        dosage: productDosage,
        packaging: productPackaging,
        sideEffects: productSideEffects,
        uses: productUses,
      });

      alert("Thêm sản phẩm thành công!");
      document.getElementById("product-form").reset();
      await loadProducts();
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm:", error);
      alert("Có lỗi xảy ra khi thêm sản phẩm!");
    }
  });

// Hiển thị sản phẩm
async function loadProducts() {
  try {
    const productTableBody = document.getElementById("product-list");
    let htmls = "";
    let index = 1;
    const querySnapshot = await getDocs(collection(db, "product"));

    querySnapshot.forEach((doc) => {
      const product = doc.data();
      htmls += `
        <tr class="product-item text-center">
          <th>${index}</th>
          <td><img src="${product.imageUrl}" alt="${product.name}"></td>
          <td>${product.name}</td>
          <td>${product.price.toLocaleString("vi-VN")} VND</td>
          <td>
            <button class="btn btn-danger btn-sm btn-delete-product rounded-sm" data-id="${
              doc.id
            }">Xóa</button>
          </td>
        </tr>
      `;
      index++;
    });

    productTableBody.innerHTML = htmls;

    document.querySelectorAll(".btn-delete-product").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const productId = btn.getAttribute("data-id");
        if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
          try {
            await deleteDoc(doc(db, "product", productId));
            alert("Xóa sản phẩm thành công!");
            await loadProducts();
          } catch (error) {
            console.error("Lỗi khi xóa sản phẩm:", error);
            alert("Có lỗi xảy ra khi xóa sản phẩm!");
          }
        }
      });
    });
  } catch (error) {
    console.error("Lỗi khi tải danh sách sản phẩm:", error);
  }
}

loadProducts();
