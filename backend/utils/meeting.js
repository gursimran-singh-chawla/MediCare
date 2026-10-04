function compactId(value) {
  return String(value || '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(-10)
    .toLowerCase();
}

function buildMeetingLink(appointment) {
  const baseUrl = process.env.MEETING_BASE_URL || 'https://meet.jit.si';
  const room = `medicare-${compactId(appointment._id)}-${compactId(appointment.orderId)}`;
  return `${baseUrl.replace(/\/$/, '')}/${room}`;
}

function buildReceiptNumber(appointment) {
  return `MC-${new Date().getFullYear()}-${compactId(appointment._id).toUpperCase()}`;
}

module.exports = {
  buildMeetingLink,
  buildReceiptNumber
};
