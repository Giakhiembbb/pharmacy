import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js";

const inpEmail = document.querySelector("#email");
const inpPwd = document.querySelector("#password");
const loginForm = document.querySelector("#login-form");

function handleLogin(event) {
  event.preventDefault();
  let email = inpEmail.value;
  let password = inpPwd.value;

  if (!email || !password) {
    alert("Vui lòng điền đủ các trường");
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      const userSession = {
        user: {
          email: user.email, // Lưu email thay vì toàn bộ user object
        },
        expiry: new Date().getTime() + 2 * 60 * 60 * 1000, // 2 giờ
      };
      localStorage.setItem("user_session", JSON.stringify(userSession));
      alert("Đăng nhập thành công");
      window.location.href = "index.html";
    })
    .catch((error) => {
      alert("Lỗi: " + error.message);
    });
}

loginForm.addEventListener("submit", handleLogin);
