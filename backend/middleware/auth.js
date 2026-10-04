function requirePatient(req, res, next) {
  if (req.session.user) return next();
  return res.status(401).json({ success: false, message: 'Please login as a patient to continue.' });
}

function requireDoctor(req, res, next) {
  if (req.session.doctor) return next();
  return res.status(401).json({ success: false, message: 'Please login as a doctor to continue.' });
}

function requireAdmin(req, res, next) {
  if (req.session.isAdmin) return next();
  return res.status(401).json({ success: false, message: 'Please login as admin to continue.' });
}

module.exports = { requirePatient, requireDoctor, requireAdmin };
