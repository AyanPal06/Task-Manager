const Task = require('../models/Task');

// Get all tasks for current user
const getTasks = async (req, res, next) => {
  try {
    const { search, priority, completed } = req.query;
    // Build filter
    const filter = { user: req.userId };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (priority) filter.priority = priority;
    if (completed !== undefined) filter.completed = completed === 'true';
    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: { tasks } });
  } catch (error) {
    next(error);
  }
};

// Create task
const createTask = async (req, res, next) => {
  try {
    const { title, description, completed, priority } = req.body;
    const task = await Task.create({ title, description, completed, priority, user: req.userId });
    res.status(201).json({ success: true, message: 'Task created successfully', data: { task } });
  } catch (error) {
    next(error);
  }
};

// Update task
const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, completed, priority } = req.body;
    const task = await Task.findOneAndUpdate(
      { _id: id, user: req.userId },
      { title, description, completed, priority },
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, message: 'Task updated successfully', data: { task } });
  } catch (error) {
    next(error);
  }
};

// Delete task
const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await Task.findOneAndDelete({ _id: id, user: req.userId });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
