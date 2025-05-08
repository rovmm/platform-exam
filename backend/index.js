const express = require("express");
const mysql = require("mysql2");
require("dotenv").config();
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Create SQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Connect to DB
db.connect((err) => {
  if (err) {
    console.error("DB connection error:", err);
  } else {
    console.log("Connected to MySQL database ");
  }
});

// Sample route
app.get("/", (req, res) => {
  res.send("SQL Backend is running!");
});

app.listen(PORT, () => {
  console.log("Server running on http://localhost:${PORT}");
}); 

const geoRoutes = require("./routes/geolocation");
app.use("/geolocation", geoRoutes);
const accessRoutes = require("./routes/access");
app.use("/access", accessRoutes);


