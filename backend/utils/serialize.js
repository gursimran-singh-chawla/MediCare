function stripSensitive(doc) {
  if (!doc) return null;
  const value = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  delete value.password;
  return value;
}

function sessionPayload(req) {
  return {
    user: stripSensitive(req.session.user),
    doctor: stripSensitive(req.session.doctor),
    isAdmin: Boolean(req.session.isAdmin),
    mockMode: process.env.MOCK_MODE === 'true',
    mockPayments: process.env.MOCK_PAYMENTS === 'true'
  };
}

module.exports = { stripSensitive, sessionPayload };
