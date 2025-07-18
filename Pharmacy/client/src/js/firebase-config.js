// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC1Q1o2sSAPnAY2CB2ZL_04_LvUzObwQ8Q",
  authDomain: "pharmacy-c9881.firebaseapp.com",
  projectId: "pharmacy-c9881",
  storageBucket: "pharmacy-c9881.firebasestorage.app",
  messagingSenderId: "287439415503",
  appId: "1:287439415503:web:b82da2c47f3a6443746fba",
  measurementId: "G-DGM9F3614Q"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Khởi tạo các dịch vụ
const auth = getAuth(app);
const db = getFirestore(app);

// Xuất các dịch vụ để dùng trong các file khác
export { auth, db };