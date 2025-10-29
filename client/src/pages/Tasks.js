import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Tasks = () => {
  const { accessToken } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', priority: 'medium', completed: false });
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { if (accessToken) { fetchTasks(); } }, [accessToken]);
  useEffect(() => { filterTasks(); }, [tasks, searchTerm, priorityFilter, statusFilter]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks', { headers: { Authorization: `Bearer ${accessToken}` } });
      if (response.data.success) setTasks(response.data.data.tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to fetch tasks');
    } finally { setLoading(false); }
  };

  const filterTasks = () => {
    let filtered = [...tasks];
    if (searchTerm) {
      filtered = filtered.filter(task => task.title.toLowerCase().includes(searchTerm.toLowerCase()) || task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (priorityFilter) filtered = filtered.filter(task => task.priority === priorityFilter);
    if (statusFilter) {
      const isCompleted = statusFilter === 'completed';
      filtered = filtered.filter(task => task.completed === isCompleted);
    }
    setFilteredTasks(filtered);
  };

  const handleOpenModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({ title: task.title, description: task.description, priority: task.priority, completed: task.completed });
    } else {
      setEditingTask(null);
      setFormData({ title: '', description: '', priority: 'medium', completed: false });
    }
    setShowModal(true); setError('');
  };

  const handleCloseModal = () => {
    setShowModal(false); setEditingTask(null); setFormData({ title: '', description: '', priority: 'medium', completed: false }); setError('');
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (!formData.title.trim()) { setError('Title is required'); return; }
    try {
      if (editingTask) {
        const response = await api.put(`/tasks/${editingTask._id}`, formData, { headers: { Authorization: `Bearer ${accessToken}` } });
        if (response.data.success) setTasks(tasks.map(t => t._id === editingTask._id ? response.data.data.task : t));
      } else {
        const response = await api.post('/tasks', formData, { headers: { Authorization: `Bearer ${accessToken}` } });
        if (response.data.success) setTasks([response.data.data.task, ...tasks]);
      }
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const response = await api.delete(`/tasks/${taskId}`, { headers: { Authorization: `Bearer ${accessToken}` } });
      if (response.data.success) setTasks(tasks.filter(t => t._id !== taskId));
    } catch (error) { alert('Failed to delete task'); }
  };

  const toggleComplete = async (task) => {
  try {
    // ✅ Send full valid body including title & priority (as required by Joi)
    const response = await api.put(
      `/tasks/${task._id}`,
      {
        title: task.title,
        description: task.description || '',
        completed: !task.completed,
        priority: task.priority || 'medium'
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    if (response.data.success) {
      setTasks(tasks.map(t => t._id === task._id ? response.data.data.task : t));
    }
  } catch (error) {
    console.error('Toggle Error:', error.response?.data || error.message);
    alert('Failed to update task');
  }
};


  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">My Tasks</h1>
          <button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition">+ New Task</button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search tasks..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (<div className="text-center py-12"><div className="text-xl text-gray-600">Loading tasks...</div></div>) : filteredTasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">No tasks found</p>
            <button onClick={() => handleOpenModal()} className="mt-4 text-blue-600 hover:underline">Create your first task</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map(task => (
              <div key={task._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <input type="checkbox" checked={task.completed} onChange={() => toggleComplete(task)} className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
                    <h3 className={`font-semibold text-lg ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>{task.title}</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                </div>

                {task.description && (<p className="text-gray-600 text-sm mb-4">{task.description}</p>)}

                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-xs text-gray-500">{new Date(task.createdAt).toLocaleDateString()}</span>
                  <div className="flex space-x-2">
                    <button onClick={() => handleOpenModal(task)} className="text-blue-600 hover:text-blue-800 font-medium text-sm">Edit</button>
                    <button onClick={() => handleDelete(task._id)} className="text-red-600 hover:text-red-800 font-medium text-sm">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">{editingTask ? 'Edit Task' : 'Create New Task'}</h2>

              {error && (<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>)}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter task title" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter task description" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select name="priority" value={formData.priority} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                {editingTask && (
                  <div className="flex items-center">
                    <input type="checkbox" name="completed" checked={formData.completed} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
                    <label className="ml-2 text-sm font-medium text-gray-700">Mark as completed</label>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition">{editingTask ? 'Update' : 'Create'}</button>
                  <button type="button" onClick={handleCloseModal} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 rounded-lg transition">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;
