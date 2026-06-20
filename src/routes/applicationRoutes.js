const express = require('express');
const { getCompanies, getApplications, createApplication, updateApplication } = require('../controllers/applicationController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAuth);

router.get('/companies', getCompanies);
router.get('/', getApplications);
router.post('/', createApplication);
router.put('/:applicationId', updateApplication);

module.exports = router;
