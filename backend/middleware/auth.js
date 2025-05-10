
function isTeacher(req, res, next) {
  if (req.session.user?.role === 'enseignant') {
    return next();
  }
  return res.status(403).send("Accès réservé aux enseignants");
}

module.exports = { isTeacher };

  