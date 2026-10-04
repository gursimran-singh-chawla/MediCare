const Contact = require('../models/Contact');
const asyncHandler = require('../utils/asyncHandler');
const { sessionPayload } = require('../utils/serialize');

function getSession(req, res) {
  res.json({ success: true, ...sessionPayload(req) });
}

const submitContact = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;
  await Contact.create({ name, email, subject, message });
  res.json({ success: true, message: 'Your message has been sent successfully.' });
});

function chat(req, res) {
  const userMessage = (req.body.message || '').toLowerCase();
  const user = req.session.user;
  let reply = "Sorry, I didn't understand that.";

  if (userMessage.includes('hello') || userMessage.includes('hi')) {
    reply = user ? `Hello ${user.name}! How can I assist you today?` : 'Hello! How can I assist you today?';
  } else if (userMessage.includes('book') || userMessage.includes('appointment')) {
    reply = user ? 'You can book an appointment from Find Doctors.' : 'Please log in to book an appointment.';
  } else if (userMessage.includes('doctor') || userMessage.includes('specialist')) {
    reply = 'We have specialists in cardiology, dermatology, dentistry, and more!';
  } else if (userMessage.includes('pharmacy') || userMessage.includes('medicine')) {
    reply = 'Our pharmacy is available through the services workflow.';
  } else if (userMessage.includes('donate') || userMessage.includes('donation')) {
    reply = 'You can donate from the Donate page. Thank you!';
  } else if (userMessage.includes('services')) {
    reply = 'We offer doctor appointments, pharmacy services, and donation options.';
  } else if (userMessage.includes('thanks') || userMessage.includes('thank you')) {
    reply = "You're welcome!";
  }

  res.json({ success: true, reply });
}

module.exports = { getSession, submitContact, chat };
