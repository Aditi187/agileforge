const express = require('express');
const router = express.Router();
const { getActivities } = require('../controllers/activityController');
const { auth } = require('../middleware/auth');

router.use(auth);
router.get('/', getActivities);

module.exports = router;
