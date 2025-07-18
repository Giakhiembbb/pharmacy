import { auth, db } from './firebase-config';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js";
import {
  collection,
  addDoc,
} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";

const inpUsername = document.querySelector(".inp-username");
const inpEmail = document.querySelector(".inp-email");
const inpPwd = document.querySelector(".inp-pwd");
const inpConfirmPwd = document.querySelector(".inp-cf-pw");
const registerForm = document.querySelector("#register-form");

function handleRegister(event) {
  event.preventDefault();
  let username = inpUsername.value;
  let email = inpEmail.value;
  let password = inpPwd.value;
  let confirmPassword = inpConfirmPwd.value;
  let role_id = 2; // Guest mặc định

  if (!username || !email || !password || !confirmPassword) {
    alert("Vui lòng điền đủ các trường");
    return;
  }
  if (password !== confirmPassword) {
    alert("Mật khẩu không khớp");
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      const userData = {
        username,
        email,
        password, // Lưu ý: Trong thực tế, không lưu password plaintext => mã hóa
        role_id,
        balance: 0,
      };

      return addDoc(collection(db, "users"), userData);
    })
    .then(() => {
      alert("Đăng ký thành công");
      window.location.href = "login.html";
    })
    .catch((error) => {
      alert("Lỗi: " + error.message);
    });
}

registerForm.addEventListener("submit", handleRegister);
