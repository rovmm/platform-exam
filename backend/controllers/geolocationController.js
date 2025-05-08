const db = require('../models/db');

exports.saveGeolocation = (req, res) => {
  const { lat, lng } = req.body;
  const userId = req.session.userId;
  if (!userId) return res.status(401).send("Unauthorized");

  const sql = `INSERT INTO exam_results (user_id, geolocation_lat, geolocation_lng)
               VALUES (?, ?, ?)
               ON DUPLICATE KEY UPDATE geolocation_lat = VALUES(geolocation_lat), geolocation_lng = VALUES(geolocation_lng)`;

  db.query(sql, [userId, lat, lng], (err) => {
    if (err) return res.status(500).send("Error saving geolocation");
    res.status(200).send("Geolocation saved");
  });
};
