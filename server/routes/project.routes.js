const express = require('express');
const router = express.Router();
const { getProjects, getProject, createProject, updateProject, deleteProject } = require('../controllers/projectController');
const { auth, roleCheck } = require('../middleware/auth');

router.use(auth);

router.route('/')
  .get(getProjects)
  .post(roleCheck('admin', 'project_lead'), createProject);

router.route('/:id')
  .get(getProject)
  .put(roleCheck('admin', 'project_lead'), updateProject)
  .delete(roleCheck('admin'), deleteProject);

module.exports = router;
