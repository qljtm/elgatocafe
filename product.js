import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://ofdcklmpttvdlikioamj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mZGNrbG1wdHR2ZGxpa2lvYW1qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTk3MjUyNSwiZXhwIjoyMDYxNTQ4NTI1fQ.qjZCNSDPaig7OLbzZjSzQtEjg-ZUpJiFNprsBS0UmSw'
const supabase = createClient(supabaseUrl, supabaseKey)
document.addEventListener('DOMContentLoaded', function () {
    const table = document.querySelector('table');
    const overlay = document.getElementById('overlay');
    const editModal = document.getElementById('editModal');
    const addModal = document.getElementById('addModal');
    const cancelEdit = document.getElementById('cancelEdit');
    const cancelAdd = document.getElementById('cancelAdd');
    const editForm = document.getElementById('editForm');
    const addForm = document.getElementById('addForm');
    const totalProductsSpan = document.getElementById('totalProducts');
    const productTable = document.getElementById('productTable');
    const addProductBtn = document.getElementById('addProductBtn');
    
    let currentRow = null;

    async function fetchProducts() {
        const { data, error } = await supabase.from('products').select('*');
        if (error) {
            console.error("Error fetching products:", error);
            return;
        }
        displayProducts(data);
        updateTotalProducts(data.length);
    }

    function displayProducts(products) {
        productTable.innerHTML = '';
        products.forEach(product => {
            const newRow = document.createElement('tr');
            newRow.setAttribute('data-id', product.id);
            newRow.innerHTML = `
                <td><img src="${product.img}" alt="${product.product}" style="width: 50px; height: 50px;"></td>
                <td>${product.product}</td>
                <td>${product.desc}</td>
                <td>${product.price}</td>
                <td>${product.category}</td>
                <td>
                    <button class="btn edit">Edit</button>
                    <button class="btn delete">Delete</button>
                </td>
            `;
            productTable.appendChild(newRow);
        });
    }

    function updateTotalProducts(count) {
        totalProductsSpan.textContent = count;
    }

    table.addEventListener('click', function (e) {
        if (e.target.classList.contains('edit')) {
            currentRow = e.target.closest('tr');
            const cells = currentRow.children;

            const productId = currentRow.getAttribute('data-id');
            const productName = cells[1].textContent;
            const productDescription = cells[2].textContent;
            const productPrice = cells[3].textContent;
            const productCategory = cells[4].textContent;

            document.getElementById('editName').value = productName;
            document.getElementById('editDescription').value = productDescription;
            document.getElementById('editPrice').value = productPrice;
            document.getElementById('editCategory').value = productCategory;

            overlay.style.display = 'block';
            editModal.style.display = 'block';
            document.getElementById('editProductId').value = productId;
        }

        if (e.target.classList.contains('delete')) {
            const row = e.target.closest('tr');
            const productId = row.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this product?')) {
                deleteProduct(productId);
            }
        }
    });

    cancelEdit.addEventListener('click', function () {
        overlay.style.display = 'none';
        editModal.style.display = 'none';
    });

    editForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const productId = document.getElementById('editProductId').value;
        const productName = document.getElementById('editName').value;
        const productDescription = document.getElementById('editDescription').value;
        const productPrice = document.getElementById('editPrice').value;
        const productCategory = document.getElementById('editCategory').value;

        const { error } = await supabase
            .from('products')
            .update({
                product: productName,
                desc: productDescription,
                price: productPrice,
                category: productCategory
            })
            .eq('id', productId);

        if (error) {
            console.error("Error updating product:", error);
        } else {
            currentRow.children[1].textContent = productName;
            currentRow.children[2].textContent = productDescription;
            currentRow.children[3].textContent = productPrice;
            currentRow.children[4].textContent = productCategory;
            overlay.style.display = 'none';
            editModal.style.display = 'none';
        }
    });

    addProductBtn.addEventListener('click', function () {
        overlay.style.display = 'block';
        addModal.style.display = 'block';
    });

    cancelAdd.addEventListener('click', function () {
        overlay.style.display = 'none';
        addModal.style.display = 'none';
    });

addForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const name = document.getElementById('addName').value;
    const description = document.getElementById('addDescription').value;
    const price = document.getElementById('addPrice').value;
    const category = document.getElementById('addCategory').value;
    const imgFile = document.getElementById('addImage').files[0];

    let imgUrl = "";
    if (imgFile) {
        // Upload image to the 'assets' folder in Supabase storage
        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('test') 
            .upload(`assets/${imgFile.name}`, imgFile, { upsert: true });  

        if (uploadError) {
            console.error("Error uploading image:", uploadError);
            return;
        }
       
        imgUrl = `https://ofdcklmpttvdlikioamj.supabase.co/storage/v1/object/public/test/${uploadData.path}`;
    }

    const { data, error } = await supabase
        .from('products')
        .insert([{ product: name, desc: description, price, category, img: imgUrl }]);

    if (error) {
        console.error("Error adding product:", error);
    } else {
        if (data && data.length > 0) {
            window.location.reload();  
        } else {
            console.error("No data returned after inserting product.");
        }
    }
});




    async function deleteProduct(productId) {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', productId);

        if (error) {
            console.error("Error deleting product:", error);
        } else {
            const row = document.querySelector(`tr[data-id="${productId}"]`);
            row.remove();
            updateTotalProducts(productTable.querySelectorAll('tr').length);
        }
    }

    fetchProducts();
});
