const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { validateTask } = require('../middleware/validation');
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');

router.get('/', auth, getTasks);
router.post('/', auth, validateTask, createTask);
router.put('/:id', auth, validateTask, updateTask);
router.delete('/:id', auth, deleteTask);

module.exports = router;
