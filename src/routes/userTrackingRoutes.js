const express = require('express');
const { updateProblemStatus, getUserTrackedProblems } = require('../controllers/userTrackingController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAuth);

router.get('/', getUserTrackedProblems);

router.put('/problems/:problemId', updateProblemStatus);

module.exports = router;
