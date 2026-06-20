const express = require('express');
const { getProblems, getTopics } = require('../controllers/problemController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAuth);

router.get('/', getProblems);
router.get('/topics', getTopics);

module.exports = router;
