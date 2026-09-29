from flask import Flask, jsonify, request
from flask_cors import CORS
from database import create_tables, get_connection

app = Flask(__name__)

CORS(app)

# Create database tables
create_tables()


# Home route
@app.route("/")
def home():
    return jsonify({
        "message": "WMS Backend is running"
    })


# Get all products
@app.route("/api/products", methods=["GET"])
def get_products():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT * FROM products")
    products = cursor.fetchall()

    connection.close()

    return jsonify([dict(product) for product in products])


# Add a new product
@app.route("/api/products", methods=["POST"])
def add_product():
    data = request.get_json()

    name = data.get("name")
    sku = data.get("sku")
    quantity = data.get("quantity", 0)

    if not name or not sku:
        return jsonify({
            "error": "Product name and SKU are required"
        }), 400

    connection = get_connection()
    cursor = connection.cursor()

    try:
        cursor.execute("""
            INSERT INTO products (name, sku, quantity)
            VALUES (?, ?, ?)
        """, (name, sku, quantity))

        connection.commit()

        product_id = cursor.lastrowid

        connection.close()

        return jsonify({
            "message": "Product added successfully",
            "id": product_id
        }), 201

    except Exception as error:
        connection.close()

        return jsonify({
            "error": str(error)
        }), 400


# Search products
@app.route("/api/products/search", methods=["GET"])
def search_products():
    search = request.args.get("q", "")

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT * FROM products
        WHERE name LIKE ? OR sku LIKE ?
    """, (f"%{search}%", f"%{search}%"))

    products = cursor.fetchall()

    connection.close()

    return jsonify([dict(product) for product in products])


# Edit product
@app.route("/api/products/<int:product_id>", methods=["PUT"])
def update_product(product_id):
    data = request.get_json()

    name = data.get("name")
    sku = data.get("sku")
    quantity = data.get("quantity")

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        UPDATE products
        SET name = ?, sku = ?, quantity = ?
        WHERE id = ?
    """, (name, sku, quantity, product_id))

    connection.commit()

    if cursor.rowcount == 0:
        connection.close()

        return jsonify({
            "error": "Product not found"
        }), 404

    connection.close()

    return jsonify({
        "message": "Product updated successfully"
    })


# Delete product
@app.route("/api/products/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        DELETE FROM products
        WHERE id = ?
    """, (product_id,))

    connection.commit()

    if cursor.rowcount == 0:
        connection.close()

        return jsonify({
            "error": "Product not found"
        }), 404

    connection.close()

    return jsonify({
        "message": "Product deleted successfully"
    })

# Get all storage locations
@app.route("/api/locations", methods=["GET"])
def get_locations():

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT * FROM storage_locations
    """)

    locations = cursor.fetchall()

    connection.close()

    return jsonify([dict(location) for location in locations])


# Add a storage location
@app.route("/api/locations", methods=["POST"])
def add_location():

    data = request.get_json()

    location_code = data.get("location_code")
    description = data.get("description", "")

    if not location_code:
        return jsonify({
            "error": "Location code is required"
        }), 400

    connection = get_connection()
    cursor = connection.cursor()

    try:

        cursor.execute("""
            INSERT INTO storage_locations
            (location_code, description)
            VALUES (?, ?)
        """, (location_code, description))

        connection.commit()

        location_id = cursor.lastrowid

        connection.close()

        return jsonify({
            "message": "Storage location added successfully",
            "id": location_id
        }), 201

    except Exception as error:

        connection.close()

        return jsonify({
            "error": str(error)
        }), 400

    # Get all inbound records
@app.route("/api/inbound", methods=["GET"])
def get_inbound():

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            inbound.id,
            products.name AS product_name,
            products.sku,
            inbound.quantity,
            inbound.received_date
        FROM inbound
        JOIN products
        ON inbound.product_id = products.id
        ORDER BY inbound.id DESC
    """)

    inbound_records = cursor.fetchall()

    connection.close()

    return jsonify([
        dict(record)
        for record in inbound_records
    ])


# Add inbound stock
@app.route("/api/inbound", methods=["POST"])
def add_inbound():

    data = request.get_json()

    product_id = data.get("product_id")
    quantity = data.get("quantity")

    if not product_id or not quantity:
        return jsonify({
            "error": "Product and quantity are required"
        }), 400

    if quantity <= 0:
        return jsonify({
            "error": "Quantity must be greater than 0"
        }), 400

    connection = get_connection()
    cursor = connection.cursor()

    # Check whether product exists
    cursor.execute("""
        SELECT * FROM products
        WHERE id = ?
    """, (product_id,))

    product = cursor.fetchone()

    if not product:

        connection.close()

        return jsonify({
            "error": "Product not found"
        }), 404

    # Add inbound record
    cursor.execute("""
        INSERT INTO inbound
        (product_id, quantity)
        VALUES (?, ?)
    """, (product_id, quantity))

    # Increase product stock
    cursor.execute("""
        UPDATE products
        SET quantity = quantity + ?
        WHERE id = ?
    """, (quantity, product_id))

    # Add activity history
    cursor.execute("""
        INSERT INTO activity_history
        (action, description)
        VALUES (?, ?)
    """, (
        "INBOUND",
        f"Received {quantity} units of {product['name']}"
    ))

    connection.commit()

    connection.close()

    return jsonify({
        "message": "Inbound stock added successfully"
    }), 201

# Get all outbound orders
@app.route("/api/outbound", methods=["GET"])
def get_outbound():

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            outbound_orders.id,
            products.name AS product_name,
            products.sku,
            outbound_orders.quantity,
            outbound_orders.order_date
        FROM outbound_orders
        JOIN products
        ON outbound_orders.product_id = products.id
        ORDER BY outbound_orders.id DESC
    """)

    outbound_records = cursor.fetchall()

    connection.close()

    return jsonify([
        dict(record)
        for record in outbound_records
    ])


# Create outbound order
@app.route("/api/outbound", methods=["POST"])
def add_outbound():

    data = request.get_json()

    product_id = data.get("product_id")
    quantity = data.get("quantity")

    if not product_id or not quantity:
        return jsonify({
            "error": "Product and quantity are required"
        }), 400

    if quantity <= 0:
        return jsonify({
            "error": "Quantity must be greater than 0"
        }), 400

    connection = get_connection()
    cursor = connection.cursor()

    # Check product
    cursor.execute("""
        SELECT * FROM products
        WHERE id = ?
    """, (product_id,))

    product = cursor.fetchone()

    if not product:

        connection.close()

        return jsonify({
            "error": "Product not found"
        }), 404

    # Check available stock
    if product["quantity"] < quantity:

        connection.close()

        return jsonify({
            "error": "Insufficient stock"
        }), 400

    # Create outbound order
    cursor.execute("""
        INSERT INTO outbound_orders
        (product_id, quantity)
        VALUES (?, ?)
    """, (product_id, quantity))

    # Decrease stock
    cursor.execute("""
        UPDATE products
        SET quantity = quantity - ?
        WHERE id = ?
    """, (quantity, product_id))

    # Add activity
    cursor.execute("""
        INSERT INTO activity_history
        (action, description)
        VALUES (?, ?)
    """, (
        "OUTBOUND",
        f"Dispatched {quantity} units of {product['name']}"
    ))

    connection.commit()

    connection.close()

    return jsonify({
        "message": "Outbound order created successfully"
    }), 201

# Get activity history
@app.route("/api/activity", methods=["GET"])
def get_activity():

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT *
        FROM activity_history
        ORDER BY id DESC
    """)

    activities = cursor.fetchall()

    connection.close()

    return jsonify([
        dict(activity)
        for activity in activities
    ])

# Dashboard summary
@app.route("/api/dashboard", methods=["GET"])
def get_dashboard():

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT COUNT(*) AS total_products
        FROM products
    """)

    total_products = cursor.fetchone()["total_products"]

    cursor.execute("""
        SELECT COALESCE(SUM(quantity), 0) AS total_stock
        FROM products
    """)

    total_stock = cursor.fetchone()["total_stock"]

    cursor.execute("""
        SELECT COUNT(*) AS total_inbound
        FROM inbound
    """)

    total_inbound = cursor.fetchone()["total_inbound"]

    cursor.execute("""
        SELECT COUNT(*) AS total_outbound
        FROM outbound_orders
    """)

    total_outbound = cursor.fetchone()["total_outbound"]

    connection.close()

    return jsonify({
        "total_products": total_products,
        "total_stock": total_stock,
        "total_inbound": total_inbound,
        "total_outbound": total_outbound
    })


if __name__ == "__main__":
    app.run(debug=True)