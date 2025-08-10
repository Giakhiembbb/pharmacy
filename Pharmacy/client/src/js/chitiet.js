import { getProductList } from './chitiet2.js';

window.addEventListener('DOMContentLoaded', ()=>{
    const productList = document.querySelector('.product-list');
    // Gọi hàm getProductList
    getProductList(productList)
})