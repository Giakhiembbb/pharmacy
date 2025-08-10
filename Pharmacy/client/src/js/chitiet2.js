import { db } from "./firebase-config.js";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  where,
} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";
import { checkSession } from "./check-session.js";

// Hiển thị danh sách sản phẩm
export async function getProductList(container, limitCount) {
  let htmls = "";
  try {
    const q = query(
      collection(db, "product"),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      const product = doc.data();
      const productId = doc.id;
      const formattedPrice = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(product.price);
      htmls += `
        <div class="product-item col-md-3 col-6">
          <div class="content p-2">
            <img src="${product.imageUrl}" alt="${product.name}" class="img-fluid rounded">
            <div class="text p-2">
              <div class="d-flex justify-content-between flex-column align-items-center">
                <h5 class="mb-2 text-uppercase">${product.name}</h5>
                <p class="mb-3">Giá: <span class="fs-6 fw-semibold text-danger">${formattedPrice}</span></p>
              </div>
              <button class="btn btn-primary btn-order mt-2 w-100" data-id="${productId}">Xem</button>
            </div>
          </div>
        </div>
      `;
    });
    container.innerHTML = htmls;

    // Sự kiện click đặt hàng
    let btnOrder = document.querySelectorAll(".btn-order");
    btnOrder.forEach((btn) => {
      btn.addEventListener("click", function () {
        const productId = this.getAttribute("data-id");
        checkSession();
        showOrderForm(productId);
      });
    });
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm: ", error);
  }
}

// Hiển thị form đặt hàng chi tiết
async function showOrderForm(productId) {
  let orderForm = document.querySelector(".order-form");
  orderForm.style.display = "block";

  try {
    const docRef = doc(db, "product", productId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const product = docSnap.data();
      const formattedPrice = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(product.price);

      orderForm.innerHTML = `
        <div class="content p-3 bg-light rounded shadow">
          <button class="btn btn-outline-dark btn-cancel mb-3">Đóng</button>
          <div class="row">
            <div class="col-md-4 col-12 mb-3">
              <img src="${product.imageUrl}" alt="${product.name}" class="img-fluid rounded" h>
            </div>
            <div class="col-md-8 col-12">
              <h5>${product.name}</h5>
              <p><strong>Giá:</strong> ${formattedPrice}</p>
              <p><strong>Mô tả:</strong> ${product.description || "Đang cập nhật"}</p>
              <p><strong>Số lượng:</strong> ${product.packaging || "Đang cập nhật"}</p>
              <p><strong>Liều dùng:</strong> ${product.dosage || "Đang cập nhật"}</p>
              <p><strong>Nhà sản xuất:</strong> ${product.producer|| "Đang cập nhật"}</p>
              <p><strong>Dạng:</strong> ${product.shape || "Đang cập nhật"}</p>
              <p><strong>Tác dụng chính:</strong> ${product.uses|| "Đang cập nhật"}</p>
              <p><strong>Tác dụng phụ:</strong> ${product.sideEffects || "Đang cập nhật"}</p>

      `;

      // Đóng form
      const btnCancel = orderForm.querySelector(".btn-cancel");
      btnCancel.addEventListener("click", () => {
        orderForm.innerHTML = "";
        orderForm.style.display = "none";
      });

      // Xác nhận đơn hàng
      const btnConfirmOrder = orderForm.querySelector(".btn-confirm-order");
      btnConfirmOrder.addEventListener("click", function (e) {
        e.preventDefault();
        const quantity = parseInt(document.getElementById("quantity").value);
        const productPrice = parseFloat(this.getAttribute("data-price"));
        handleOrder(productId, quantity, productPrice);
      });
    } else {
      console.log("Không tìm thấy sản phẩm!");
    }
  } catch (error) {
    console.error("Lỗi khi lấy thông tin sản phẩm: ", error);
  }
}

let userSession = JSON.parse(localStorage.getItem("user_session"));

// Xử lý đơn hàng
async function handleOrder(productId, quantity, productPrice) {
  if (!userSession) {
    alert("Vui lòng đăng nhập để đặt hàng!");
    return;
  }

  const authorEmail = userSession.user.email;

  try {
    const q = query(collection(db, "users"), where("email", "==", authorEmail));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("Không tìm thấy người dùng!");
      return;
    }

    for (const userDoc of querySnapshot.docs) {
      const author = userDoc.data();
      const totalCost = productPrice * quantity;

      if (author.balance < totalCost) {
        alert("Số dư ví không đủ!");
        return;
      }

      const productDoc = await getDoc(doc(db, "product", productId));
      const product = productDoc.data();

      const orderData = {
        author: authorEmail,
        product: {
          id: productId,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          producer: product.producer || "",
          packaging: product.packaging || "",
          descript: product.descript || "",
          dosage: product.dosage || "",
          sideEffects: product.sideEffects || "",
          shape: product.shape|| "",
          interactions: product.interactions || ""
        },
        quantity: parseInt(quantity),
        status: 0,
        createdAt: new Date()
      };

      await addDoc(collection(db, "orders"), orderData);
      await updateDoc(userDoc.ref, {
        balance: author.balance - totalCost
      });

      alert("Đặt hàng thành công!");
      document.querySelector(".order-form").style.display = "none";
    }
  } catch (error) {
    console.error("Lỗi khi đặt hàng hoặc cập nhật số dư: ", error);
  }
}

const productContainer = document.getElementById("product-list");
getProductList(productContainer, 12); // số 12 là số sản phẩm muốn hiện