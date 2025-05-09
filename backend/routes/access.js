// routes/access.js
const express = require("express");
const bodyParser = require("body-parser");
const db = require("../models/db");

const router = express.Router();
router.use(bodyParser.json());

// Access exam by code
router.get("/exam/:code", (req, res) => {
  const examCode = req.params.code;
  res.send(`Accessing exam with code: ${examCode}`);
});

// Registration route
router.post("/register", (req, res) => {
  const { name, email, examCode } = req.body;

  if (!name || !email || !examCode) {
    return res.status(400).send("Missing required fields");
  }

  const sql =
    "INSERT INTO registrations (name, email, exam_code) VALUES (?, ?, ?)";
  db.query(sql, [name, email, examCode], (err) => {
    if (err) return res.status(500).send("DB Error");
    res.send("Registration successful");
  });
});

module.exports = router;
