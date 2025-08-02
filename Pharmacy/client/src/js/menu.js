import { getProductList } from './get-products.js';

window.addEventListener('DOMContentLoaded', ()=>{
    const productList = document.querySelector('.product-list');
    // Gọi hàm getProductList
    getProductList(productList)
})