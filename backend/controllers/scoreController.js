const db = require('../models/db');

exports.saveScore = (req, res) => {
  const { answers } = req.body;
  const userId = req.session.userId;
  if (!userId) return res.status(401).send("Unauthorized");

  let correct = answers.filter(a => a.isCorrect).length;
  let score = Math.round((correct / answers.length) * 100);

  const sql = `UPDATE exam_results SET score = ? WHERE user_id = ?`;
  db.query(sql, [score, userId], (err) => {
    if (err) return res.status(500).send("Error saving score");
    res.status(200).send({ score });
  });
};

exports.getScore = (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(401).send("Unauthorized");

  db.query(`SELECT score FROM exam_results WHERE user_id = ?`, [userId], (err, result) => {
    if (err || result.length === 0) return res.status(500).send("Error retrieving score");
    res.status(200).send({ score: result[0].score });
  });
};
