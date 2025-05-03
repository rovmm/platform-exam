const express = require("express");
const mysql = require("mysql2");
require("dotenv").config();
const cors = require("cors");
const bcrypt = require("bcryptjs");

console.log("DB Host:", process.env.DB_HOST);
console.log("DB User:", process.env.DB_USER);
console.log("DB Password:", process.env.DB_PASSWORD);
console.log("DB Name:", process.env.DB_NAME);
console.log("PORT:", process.env.PORT);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MySQL Database Connection Setup
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

console.log("Trying to connect to database...");
db.connect((err) => {
  if (err) {
    console.error("DB connection error:", err);
    return;
  }
  console.log("Connected to MySQL database ✅");
});

// Root route
app.get("/", (req, res) => {
  res.send("SQL Backend is running! 🧠");
});

// Signup route with email check and password hashing
app.post("/signup", (req, res) => {
  const { first_name, last_name, email, password, type } = req.body;

  const checkEmailQuery = `SELECT * FROM users WHERE email = ?`;
  db.query(checkEmailQuery, [email], (err, results) => {
    if (err) {
      console.error("Error checking email:", err);
      return res.status(500).send("Database error while checking email");
    }

    if (results.length > 0) {
      return res.status(400).send("Email already exists");
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error("Error hashing password:", err);
        return res.status(500).send("Error hashing password");
      }

      const query = `INSERT INTO users (first_name, last_name, email, password, type) VALUES (?, ?, ?, ?, ?)`;
      db.query(query, [first_name, last_name, email, hashedPassword, type], (err, results) => {
        if (err) {
          console.error("Error creating user:", err);
          return res.status(500).send("Error creating user");
        }
        res.status(200).send("User created successfully");
      });
    });
  });
});

// Login route for user authentication
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const query = `SELECT * FROM users WHERE email = ?`;
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).send("Database error");
    }

    if (results.length === 0) {
      return res.status(400).send("User not found");
    }

    const user = results[0];

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error("Error comparing passwords:", err);
        return res.status(500).send("Error comparing passwords");
      }

      if (isMatch) {
        res.status(200).send("Login successful");
      } else {
        res.status(400).send("Incorrect password");
      }
    });
  });
});

// Start the server
app.listen(PORT, (err) => {
  if (err) {
    console.error("Server error:", err);
    return;
  }
  console.log(`Server running on http://localhost:${PORT}`);
});
