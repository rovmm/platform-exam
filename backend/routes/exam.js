// backend/routes/exams.js
const express = require("express");
const crypto = require("crypto");
const { isTeacher } = require("../middlewares/auth");

const router = express.Router();

// Route to create an exam
router.post("/create", isTeacher, (req, res) => {
  const examCode = crypto.randomBytes(4).toString("hex");
  const examId = Date.now().toString(); // Temporary exam ID
  const exam = {
    id: examId,
    code: examCode,
    ownerId: req.session.user.id,
  };

  req.session.exam = exam;
  res.send({ message: "Exam created", code: examCode });
});

// Route to add QCM question
router.post("/:id/qcm", isTeacher, (req, res) => {
  const examId = req.params.id;
  if (
    req.session.exam &&
    req.session.exam.id === examId &&
    req.session.exam.ownerId === req.session.user.id
  ) {
    res.send("QCM question added!");
  } else {
    res.status(403).send("You are not the owner of this exam.");
  }
});

// Route to add direct question
router.post("/:id/direct", isTeacher, (req, res) => {
  const examId = req.params.id;
  if (
    req.session.exam &&
    req.session.exam.id === examId &&
    req.session.exam.ownerId === req.session.user.id
  ) {
    res.send("Direct question added!");
  } else {
    res.status(403).send("You are not the owner of this exam.");
  }
});

module.exports = router;
