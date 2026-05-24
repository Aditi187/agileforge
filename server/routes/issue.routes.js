const express = require('express');
const router = express.Router();
const { getIssues, getIssue, createIssue, updateIssue, bulkUpdateIssues, deleteIssue, getIssueStats } = require('../controllers/issueController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.route('/')
  .get(getIssues)
  .post(createIssue);

router.put('/bulk-update', bulkUpdateIssues);
router.get('/stats/:projectId', getIssueStats);

router.route('/:id')
  .get(getIssue)
  .put(updateIssue)
  .delete(deleteIssue);

module.exports = router;
