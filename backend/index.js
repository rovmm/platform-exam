require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");

const db = require("./db");
const examRoutes = require("./routes/exams");
const geolocationRoutes = require("./routes/geolocation"); //  Phase 5
const scoreRoutes = require("./routes/score"); //  Phase 5

const app = express();
const PORT = process.env.PORT || 5000;

//  Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "exam_secret_key_123", // Replace with secure key in production
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Use true if deploying with HTTPS
  })
);

//  Root route
app.get("/", (req, res) => {
  res.send("SQL Backend is running! 🧠");
});

//  Session check (optional, can comment out)
app.get("/session", (req, res) => {
  if (req.session.user) {
    return res.status(200).json(req.session.user);
  }
  res.status(401).send("Not logged in");
});

//  Logout
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).send("Logout failed");
    }
    res.clearCookie("connect.sid");
    res.send("Logged out");
  });
});

//  Signup
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
      db.query(
        query,
        [first_name, last_name, email, hashedPassword, type],
        (err) => {
          if (err) {
            console.error("Error creating user:", err);
            return res.status(500).send("Error creating user");
          }
          res.status(200).send("User created successfully");
        }
      );
    });
  });
});

//  Login
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
        req.session.user = {
          id: user.id,
          role: user.type,
          name: `${user.first_name} ${user.last_name}`,
        };
        return res.status(200).send("Login successful");
      } else {
        return res.status(400).send("Incorrect password");
      }
    });
  });
});

//  Exams routes
app.use("/exams", examRoutes);

//  Phase 5: Geolocation and Score routes
app.use("/api", geolocationRoutes); // e.g. POST /api/geolocation
app.use("/api", scoreRoutes);       // e.g. GET /api/score

//  Start server
app.listen(PORT, (err) => {
  if (err) {
    console.error("Server error:", err);
    return;
  }
  console.log(`Server running on http://localhost:${PORT}`);
});


