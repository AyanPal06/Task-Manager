import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { setAccessToken } from '../services/api';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);
  console.log("⏳ Trying login...");

  if (!formData.email || !formData.password) {
    setError('All fields are required');
    setLoading(false);
    return;
  }

  try {
    const response = await login(formData.email, formData.password);
    console.log("✅ Login success:", response);
    const token = response?.data?.accessToken;
    if (!token) throw new Error("Access token missing from response")
    setAccessToken(token);
    navigate('/dashboard');
  }catch (err) {
  console.error("❌ Login failed:", err);
  setError(err.message || 'Invalid email or password');
  } finally {
  setLoading(false);
  }
};





  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Login</h2>

        {error && (<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>)}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter your email" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter your password" />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:bg-gray-400">{loading ? 'Logging in...' : 'Login'}</button>
        </form>

        <p className="text-center text-gray-600 mt-6">Don't have an account? <Link to="/signup" className="text-blue-600 hover:underline font-semibold">Sign up</Link></p>
      </div>
    </div>
  );
};

export default Login;
