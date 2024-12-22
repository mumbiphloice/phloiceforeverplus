const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Set up middleware
app.use(cors());  // Enable CORS for all requests
app.use(bodyParser.json());  // Parse JSON request bodies

// Set up database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'your_db_user',       // Use your database username here
    password: 'your_db_pass',   // Use your database password here
    database: 'ecommerce_db'    // Your database name
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to the database');
    }
});

// Fetch all products
app.get('/api/products', (req, res) => {
    db.query('SELECT * FROM products', (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        res.json(results);
    });
});

// Fetch product by ID
app.get('/api/products/:id', (req, res) => {
    const productId = req.params.id;
    db.query('SELECT * FROM products WHERE id = ?', [productId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(results[0]);
    });
});

// Create order
app.post('/api/orders', (req, res) => {
    const { customer_name, email, shipping_address, total_price, order_items } = req.body;

    // Insert order into the orders table
    const orderQuery = 'INSERT INTO orders (customer_name, email, shipping_address, total_price) VALUES (?, ?, ?, ?)';
    db.query(orderQuery, [customer_name, email, shipping_address, total_price], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }

        const orderId = results.insertId;  // Get the inserted order ID

        // Insert order items into the order_items table
        const orderItemsQuery = 'INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)';
        order_items.forEach(item => {
            db.query(orderItemsQuery, [orderId, item.product_id, item.quantity], (err) => {
                if (err) {
                    return res.status(500).json({ error: err });
                }
            });
        });

        res.json({ message: 'Order placed successfully!', orderId });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
