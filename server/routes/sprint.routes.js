const express = require('express');
const router = express.Router();
const { getSprints, getSprint, createSprint, updateSprint, startSprint, completeSprint, deleteSprint } = require('../controllers/sprintController');
const { auth, roleCheck } = require('../middleware/auth');

router.use(auth);

router.route('/')
  .get(getSprints)
  .post(roleCheck('admin', 'project_lead'), createSprint);

router.route('/:id')
  .get(getSprint)
  .put(roleCheck('admin', 'project_lead'), updateSprint)
  .delete(roleCheck('admin', 'project_lead'), deleteSprint);

router.put('/:id/start', roleCheck('admin', 'project_lead'), startSprint);
router.put('/:id/complete', roleCheck('admin', 'project_lead'), completeSprint);

module.exports = router;
