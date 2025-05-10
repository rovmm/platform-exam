const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const db = require("../db");

//  Destructure the isTeacher middleware correctly
const { isTeacher } = require("../middleware/auth");

// Create Exam
router.post("/create", isTeacher, (req, res) => {
  const { titre, matiere } = req.body;
  const code = crypto.randomBytes(4).toString("hex");
  const enseignantId = req.session.user.id;

  const query = `INSERT INTO exams (code, titre, matiere, enseignant_id) VALUES (?, ?, ?, ?)`;
  db.query(query, [code, titre, matiere, enseignantId], (err, result) => {
    if (err) {
      console.error("Error creating exam:", err);
      return res.status(500).send("Database error while creating exam");
    }
    res.send({ examId: result.insertId, code });
  });
});

// Add QCM Question
router.post("/:id/qcm", isTeacher, (req, res) => {
  const { question, options, bonnesReponses, note, duree } = req.body;

  const query = `
    INSERT INTO questions (exam_id, type, question, options, reponses, note, duree)
    VALUES (?, 'qcm', ?, ?, ?, ?, ?)
  `;
  db.query(
    query,
    [req.params.id, question, JSON.stringify(options), JSON.stringify(bonnesReponses), note, duree],
    (err) => {
      if (err) {
        console.error("Error adding QCM:", err);
        return res.status(500).send("Database error while adding QCM");
      }
      res.send("QCM ajouté ✅");
    }
  );
});

// Add Direct Question
router.post("/:id/direct", isTeacher, (req, res) => {
  const { question, reponse, tolerance, note, duree } = req.body;

  const query = `
    INSERT INTO questions (exam_id, type, question, reponses, tolerance, note, duree)
    VALUES (?, 'direct', ?, ?, ?, ?, ?)
  `;
  db.query(
    query,
    [req.params.id, question, JSON.stringify([reponse]), tolerance, note, duree],
    (err) => {
      if (err) {
        console.error("Error adding direct question:", err);
        return res.status(500).send("Database error while adding direct question");
      }
      res.send("Question directe ajoutée ✅");
    }
  );
});

module.exports = router;

