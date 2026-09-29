# Basic Warehouse Management System (WMS)

A simple web-based Warehouse Management System developed as part of the XP Robotics assignment.

## Project Overview

A Warehouse Management System (WMS) is used to manage and track products, inventory, storage locations, inbound stock, and outbound orders in a warehouse.

This project provides a basic WMS interface where users can manage products, track stock movement, manage storage locations, and view warehouse activity.


## Features

- Dashboard with inventory summary
- Add new products
- Edit product details
- Delete products
- Search products by name or SKU
- Manage storage locations
- Record inbound stock
- Record outbound orders
- Automatic stock updates
- Prevent outbound orders when stock is insufficient
- View current stock
- Activity history
- REST API based backend

## Tech Stack

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Python
- Flask
- Flask-CORS

### Database
- SQLite

### Tools
- Visual Studio Code
- Git
- GitHub

## System Architecture

```text
User
  |
  v
Frontend
HTML + CSS + JavaScript
  |
  | REST API
  v
Flask Backend
  |
  v
SQLite Database

## Warehouse Workflow

### Inbound Workflow

```text
Supplier
   |
   v
Inbound Order
   |
   v
Product Stock Increases
   |
   v
Activity History Updated

### Outbound Workflow 
Customer Order
   |
   v
Outbound Order
   |
   v
Stock Availability Check
   |
   v
Product Stock Decreases
   |
   v
Activity History Updated

## Project Structure

```text
wms-project/
│
├── backend/
│   ├── app.py
│   └── database.py
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── .gitignore
├── README.md
├── requirements.txt
└── venv/

## How to Run the Project

### 1. Clone the repository

```bash
git clone <your-github-repository-url>
```

### 2. Open the project

```bash
cd wms-project
```

### 3. Create a virtual environment

```bash
python -m venv venv
```

### 4. Activate the virtual environment

For Windows:

```bash
venv\Scripts\activate
```

### 5. Install dependencies

```bash
pip install -r requirements.txt
```

### 6. Start the backend

Open the backend folder:

```bash
cd backend
```

Then run:

```bash
python app.py
```

The backend will run at:

```text
http://127.0.0.1:5000
```

### 7. Start the frontend

Open the `frontend` folder in VS Code and open `index.html` using Live Server.

The WMS interface will open in the browser.

## Database

The project uses SQLite for storing:

* Products
* Storage locations
* Inbound records
* Outbound orders
* Activity history

The database file is created automatically when the Flask application starts.

## API Overview

| Method | Endpoint               | Purpose                  |
| ------ | ---------------------- | ------------------------ |
| GET    | `/api/products`        | Get all products         |
| POST   | `/api/products`        | Add a product            |
| GET    | `/api/products/search` | Search products          |
| PUT    | `/api/products/<id>`   | Update a product         |
| DELETE | `/api/products/<id>`   | Delete a product         |
| GET    | `/api/locations`       | Get storage locations    |
| POST   | `/api/locations`       | Add a storage location   |
| GET    | `/api/inbound`         | Get inbound records      |
| POST   | `/api/inbound`         | Add inbound stock        |
| GET    | `/api/outbound`        | Get outbound orders      |
| POST   | `/api/outbound`        | Create an outbound order |
| GET    | `/api/activity`        | Get activity history     |
| GET    | `/api/dashboard`       | Get dashboard statistics |


## Stock Management Logic

When inbound stock is received:

```text
Current Stock + Inbound Quantity
```

When an outbound order is created:

```text
Current Stock - Outbound Quantity
```

The system also checks whether enough stock is available before allowing an outbound order.

## Demo Video

A 3–5 minute demo video will be added here:

```text
[Demo Video Link]
```

The video will demonstrate:

* Dashboard
* Product management
* Storage locations
* Inbound stock
* Outbound orders
* Stock updates
* Activity history

## Future Improvements

Possible future improvements include:

* User authentication
* Role-based access
* Product categories
* Multiple warehouse support
* Barcode/QR code scanning
* Low-stock alerts
* Advanced reports
* Integration with warehouse automation systems

## Assignment

Developed as part of the XP Robotics assignment to demonstrate a basic Warehouse Management System using a web-based architecture.

