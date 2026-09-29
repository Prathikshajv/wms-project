const API_URL = "http://127.0.0.1:5000/api/products";

// Show selected section
function showSection(sectionId) {

    const sections = document.querySelectorAll(".section");

    sections.forEach(function(section) {
        section.classList.add("hidden");
    });

    document.getElementById(sectionId).classList.remove("hidden");

    if (sectionId === "dashboard") {
        updateDashboard();
    }

    if (sectionId === "products") {
        loadProducts();
    }
    if (sectionId === "locations") {
    loadLocations();
}
    if (sectionId === "inbound") {
    loadInboundProducts();
    loadInbound();
}

if (sectionId === "outbound") {
    loadOutboundProducts();
    loadOutbound();
}

if (sectionId === "stock") {
    loadStock();
}

if (sectionId === "activity") {
    loadActivity();
}

}


// Update dashboard numbers
async function updateDashboard() {

    const response =
        await fetch(
            "http://127.0.0.1:5000/api/dashboard"
        );

    const data =
        await response.json();

    document.getElementById(
        "totalProducts"
    ).textContent = data.total_products;

    document.getElementById(
        "totalStock"
    ).textContent = data.total_stock;

    document.getElementById(
        "totalInbound"
    ).textContent = data.total_inbound;

    document.getElementById(
        "totalOutbound"
    ).textContent = data.total_outbound;
}

// Load products when page opens
document.addEventListener("DOMContentLoaded", function () {
    loadProducts();
});


// Get all products
async function loadProducts() {

    const response = await fetch(API_URL);

    const products = await response.json();

    displayProducts(products);
}


// Display products in table
function displayProducts(products) {

    const tableBody = document.getElementById("productTableBody");

    tableBody.innerHTML = "";

    products.forEach(function (product) {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${product.sku}</td>
            <td>${product.quantity}</td>

            <td>
                <button
                    class="edit-button"
                    onclick="editProduct(${product.id}, '${product.name}', '${product.sku}', ${product.quantity})">
                    Edit
                </button>

                <button
                    class="delete-button"
                    onclick="deleteProduct(${product.id})">
                    Delete
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}


// Add product
document.getElementById("productForm").addEventListener("submit", async function (event) {

    event.preventDefault();

    const name = document.getElementById("productName").value;
    const sku = document.getElementById("productSku").value;
    const quantity = document.getElementById("productQuantity").value;

    const response = await fetch(API_URL, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            name: name,
            sku: sku,
            quantity: Number(quantity)
        })
    });

    const result = await response.json();

    if (response.ok) {

        alert("Product added successfully!");

        document.getElementById("productForm").reset();

        loadProducts();

    } else {

        alert(result.error);
    }
});


// Search products
document.getElementById("searchInput").addEventListener("input", async function () {

    const searchValue = this.value;

    if (searchValue === "") {

        loadProducts();

        return;
    }

    const response = await fetch(
        `${API_URL}/search?q=${encodeURIComponent(searchValue)}`
    );

    const products = await response.json();

    displayProducts(products);
});


// Edit product
async function editProduct(id, currentName, currentSku, currentQuantity) {

    const newName = prompt("Enter product name:", currentName);

    if (newName === null) {
        return;
    }

    const newSku = prompt("Enter SKU:", currentSku);

    if (newSku === null) {
        return;
    }

    const newQuantity = prompt("Enter quantity:", currentQuantity);

    if (newQuantity === null) {
        return;
    }

    const response = await fetch(`${API_URL}/${id}`, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            name: newName,
            sku: newSku,
            quantity: Number(newQuantity)
        })
    });

    const result = await response.json();

    if (response.ok) {

        alert("Product updated successfully!");

        loadProducts();

    } else {

        alert(result.error);
    }
}


// Delete product
async function deleteProduct(id) {

    const confirmation = confirm(
        "Are you sure you want to delete this product?"
    );

    if (!confirmation) {
        return;
    }

    const response = await fetch(`${API_URL}/${id}`, {

        method: "DELETE"
    });

    const result = await response.json();

    if (response.ok) {

        alert("Product deleted successfully!");

        loadProducts();

    } else {

        alert(result.error);
    }
}

// Storage Locations API
const LOCATION_API_URL =
    "http://127.0.0.1:5000/api/locations";


// Load storage locations
async function loadLocations() {

    const response =
        await fetch(LOCATION_API_URL);

    const locations =
        await response.json();

    displayLocations(locations);
}


// Display locations
function displayLocations(locations) {

    const tableBody =
        document.getElementById("locationTableBody");

    tableBody.innerHTML = "";

    locations.forEach(function(location) {

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>${location.id}</td>

            <td>${location.location_code}</td>

            <td>${location.description}</td>
        `;

        tableBody.appendChild(row);
    });
}


// Add location
document
    .getElementById("locationForm")
    .addEventListener("submit", async function(event) {

        event.preventDefault();

        const locationCode =
            document.getElementById(
                "locationCode"
            ).value;

        const description =
            document.getElementById(
                "locationDescription"
            ).value;


        const response =
            await fetch(LOCATION_API_URL, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    location_code:
                        locationCode,

                    description:
                        description
                })
            });


        const result =
            await response.json();


        if (response.ok) {

            alert(
                "Storage location added successfully!"
            );

            document
                .getElementById("locationForm")
                .reset();

            loadLocations();

        } else {

            alert(result.error);
        }

    });

    // Inbound API

const INBOUND_API_URL =
    "http://127.0.0.1:5000/api/inbound";


// Load products into inbound dropdown

async function loadInboundProducts() {

    const response =
        await fetch(API_URL);

    const products =
        await response.json();

    const select =
        document.getElementById(
            "inboundProduct"
        );

    select.innerHTML = `
        <option value="">
            Select Product
        </option>
    `;

    products.forEach(function(product) {

        const option =
            document.createElement("option");

        option.value = product.id;

        option.textContent =
            `${product.name} (${product.sku})`;

        select.appendChild(option);

    });
}


// Load inbound history

async function loadInbound() {

    const response =
        await fetch(INBOUND_API_URL);

    const records =
        await response.json();

    displayInbound(records);
}


// Display inbound history

function displayInbound(records) {

    const tableBody =
        document.getElementById(
            "inboundTableBody"
        );

    tableBody.innerHTML = "";

    records.forEach(function(record) {

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>${record.id}</td>

            <td>${record.product_name}</td>

            <td>${record.sku}</td>

            <td>${record.quantity}</td>

            <td>${record.received_date}</td>
        `;

        tableBody.appendChild(row);

    });
}


// Receive stock

document
    .getElementById("inboundForm")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            const productId =
                document.getElementById(
                    "inboundProduct"
                ).value;

            const quantity =
                document.getElementById(
                    "inboundQuantity"
                ).value;


            const response =
                await fetch(
                    INBOUND_API_URL,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            product_id:
                                Number(productId),

                            quantity:
                                Number(quantity)

                        })
                    }
                );


            const result =
                await response.json();


            if (response.ok) {

                alert(
                    "Inbound stock added successfully!"
                );

                document
                    .getElementById(
                        "inboundForm"
                    )
                    .reset();

                loadInbound();

            } else {

                alert(result.error);

            }

        }
    );

    // Outbound API

const OUTBOUND_API_URL =
    "http://127.0.0.1:5000/api/outbound";


// Load products into outbound dropdown

async function loadOutboundProducts() {

    const response =
        await fetch(API_URL);

    const products =
        await response.json();

    const select =
        document.getElementById(
            "outboundProduct"
        );

    select.innerHTML = `
        <option value="">
            Select Product
        </option>
    `;

    products.forEach(function(product) {

        const option =
            document.createElement("option");

        option.value = product.id;

        option.textContent =
            `${product.name} (${product.sku}) - Stock: ${product.quantity}`;

        select.appendChild(option);

    });
}


// Load outbound history

async function loadOutbound() {

    const response =
        await fetch(OUTBOUND_API_URL);

    const records =
        await response.json();

    displayOutbound(records);
}


// Display outbound history

function displayOutbound(records) {

    const tableBody =
        document.getElementById(
            "outboundTableBody"
        );

    tableBody.innerHTML = "";

    records.forEach(function(record) {

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>${record.id}</td>

            <td>${record.product_name}</td>

            <td>${record.sku}</td>

            <td>${record.quantity}</td>

            <td>${record.order_date}</td>
        `;

        tableBody.appendChild(row);

    });
}


// Dispatch stock

document
    .getElementById("outboundForm")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            const productId =
                document.getElementById(
                    "outboundProduct"
                ).value;

            const quantity =
                document.getElementById(
                    "outboundQuantity"
                ).value;


            const response =
                await fetch(
                    OUTBOUND_API_URL,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            product_id:
                                Number(productId),

                            quantity:
                                Number(quantity)

                        })
                    }
                );


            const result =
                await response.json();


            if (response.ok) {

                alert(
                    "Outbound order created successfully!"
                );

                document
                    .getElementById(
                        "outboundForm"
                    )
                    .reset();

                loadOutbound();

            } else {

                alert(result.error);

            }

        }
    );

    // Load current stock

async function loadStock() {

    const response =
        await fetch(API_URL);

    const products =
        await response.json();

    const tableBody =
        document.getElementById(
            "stockTableBody"
        );

    tableBody.innerHTML = "";

    products.forEach(function(product) {

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>${product.id}</td>

            <td>${product.name}</td>

            <td>${product.sku}</td>

            <td>${product.quantity}</td>
        `;

        tableBody.appendChild(row);

    });
}

// Activity History API

const ACTIVITY_API_URL =
    "http://127.0.0.1:5000/api/activity";


// Load activity history

async function loadActivity() {

    const response =
        await fetch(ACTIVITY_API_URL);

    const activities =
        await response.json();

    const tableBody =
        document.getElementById(
            "activityTableBody"
        );

    tableBody.innerHTML = "";

    activities.forEach(function(activity) {

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>${activity.id}</td>

            <td>${activity.action}</td>

            <td>${activity.description}</td>

            <td>${activity.created_at}</td>
        `;

        tableBody.appendChild(row);

    });
}