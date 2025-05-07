const express = require("express");
const session = require("express-session");

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Set up session middleware
app.use(session({
  secret: "yourSecretKey",
  resave: false,
  saveUninitialized: false,
}));
const examRoutes = require("./routes/exams");
app.use("/exams", examRoutes);

// Login Route
app.post("/login", (req, res) => {
  const { id, email, role } = req.body;
  req.session.user = { id, email, role };
  res.send("Logged in successfully!");
});

// Dashboard Route
app.get("/dashboard", (req, res) => {
  if (req.session.user) {
    res.send("Welcome " + req.session.user.email);
  } else {
    res.status(401).send("Unauthorized");
  }
});

// Logout Route
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Failed to log out.");
    }
    res.send("Logged out successfully.");
  });
});

// Root Route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
