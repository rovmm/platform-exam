require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const db = require("./db"); // Assuming your db connection is here

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware Setup
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session Setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || "yourSecretKey", // Use an environment variable for secret
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production" }, // Set secure cookies in production
  })
);

// Database Connection (ensure your DB file has the correct connection code)
db.connect((err) => {
  if (err) {
    console.error("DB connection error:", err);
    process.exit(1); // Exit process on DB connection failure
  } else {
    console.log("Connected to MySQL database");
  }
});

// Root Route (for health check or confirmation)
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// Signup Route (for creating new users)
app.post("/signup", (req, res) => {
  const { first_name, last_name, email, password, type } = req.body;

  // Check if the email is already in the database
  const checkEmailQuery = "SELECT * FROM users WHERE email = ?";
  db.query(checkEmailQuery, [email], (err, results) => {
    if (err) {
      console.error("Error checking email:", err);
      return res.status(500).send("Database error while checking email");
    }

    if (results.length > 0) {
      return res.status(400).send("Email already exists");
    }

    // Hash password before saving
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error("Error hashing password:", err);
        return res.status(500).send("Error hashing password");
      }

      // Insert user into the database
      const insertUserQuery = "INSERT INTO users (first_name, last_name, email, password, type) VALUES (?, ?, ?, ?, ?)";
      db.query(insertUserQuery, [first_name, last_name, email, hashedPassword, type], (err) => {
        if (err) {
          console.error("Error creating user:", err);
          return res.status(500).send("Error creating user");
        }
        res.status(200).send("User created successfully");
      });
    });
  });
});

// Login Route (for user authentication)
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Find the user based on the email
  const query = "SELECT * FROM users WHERE email = ?";
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).send("Database error");
    }

    if (results.length === 0) {
      return res.status(400).send("User not found");
    }

    const user = results[0];

    // Compare password with the hashed password in the database
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error("Error comparing passwords:", err);
        return res.status(500).send("Error comparing passwords");
      }

      if (isMatch) {
        // Store user information in the session
        req.session.user = {
          id: user.id,
          email: user.email,
          role: user.type,
        };
        return res.status(200).send("Login successful");
      } else {
        return res.status(400).send("Incorrect password");
      }
    });
  });
});

// Session Check Route (to check if a user is logged in)
app.get("/session", (req, res) => {
  if (req.session.user) {
    res.status(200).json(req.session.user);
  } else {
    res.status(401).send("Not logged in");
  }
});

// Logout Route (to log the user out)
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).send("Logout failed");
    }
    res.clearCookie("connect.sid");
    res.send("Logged out successfully");
  });
});

// Optional: Add more routes like for exams, geolocation, etc.

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
