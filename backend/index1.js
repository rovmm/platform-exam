const express = require("express");
const session = require("express-session");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors({
  origin: "http://localhost:3000",  
  credentials: true
}));


app.use(express.json());


app.use(express.static(path.join(__dirname, "public")));


app.use(session({
  secret: "yourSecretKey",
  resave: false,
  saveUninitialized: false,
}));

// Routes
const examRoutes = require("./routes/exams");
app.use("/exams", examRoutes);

// SIGNUP ROUTE
app.post("/signup", (req, res) => {
  const { email, password } = req.body;

  // Example: Logging received data (replace with DB insert in real app)
  console.log("Received signup data:", { email, password });

  // You could add password hashing, validation, etc.
  res.json({ message: "Signup successful!" });
});

// CREATE EXAM ROUTE
app.post("/createExam", (req, res) => {
  const { title, description, audience, link } = req.body;

  console.log("Received exam data:", req.body);
  res.json({ message: "Exam created successfully!" });
});

// LOGIN ROUTE
app.post("/login", (req, res) => {
  const { id, email, role } = req.body;
  req.session.user = { id, email, role };
  res.send("Logged in successfully!");
});

// DASHBOARD ROUTE
app.get("/dashboard", (req, res) => {
  if (req.session.user) {
    res.send("Welcome " + req.session.user.email);
  } else {
    res.status(401).send("Unauthorized");
  }
});

// LOGOUT ROUTE
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Failed to log out.");
    }
    res.send("Logged out successfully.");
  });
});

// ROOT ROUTE
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// START SERVER
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


