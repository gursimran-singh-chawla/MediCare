const express = require('express');
const { getSession, submitContact, chat } = require('../controllers/generalController');

const router = express.Router();

router.get('/session', getSession);
router.post('/contact', submitContact);
router.post('/chat', chat);

module.exports = router;
