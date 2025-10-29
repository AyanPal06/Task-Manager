import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { setAccessToken } from '../services/api';

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Client-side validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await register(formData.name, formData.email, formData.password);
      setAccessToken(response.data.accessToken);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center p-4 overflow-hidden">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Sign Up</h2>

        {error && (<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>)}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="Enter your name" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="Enter your email" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="Enter your password" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="Confirm your password" />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition disabled:bg-gray-400">{loading ? 'Signing up...' : 'Sign Up'}</button>
        </form>

        <p className="text-center text-gray-600 mt-6">Already have an account? <Link to="/login" className="text-purple-600 hover:underline font-semibold">Login</Link></p>
      </div>
    </div>
  );
};

export default Signup;
