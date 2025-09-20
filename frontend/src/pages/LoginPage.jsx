import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { axiosInstance } from '../lib/axios'
import { useAuthStore } from '../store/useAuthStore'
import AuthImagePattern from '../components/AuthImagePattern'

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const navigate = useNavigate()
  const { checkAuth } = useAuthStore()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((p) => ({ ...p, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage(null)
    setIsLoggingIn(true)
    try {
      const res = await axiosInstance.post('/auth/login', formData)
      setMessage({ success: true, message: res.data.message || 'Login successful' })
      await checkAuth()
      navigate('/')
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message || 'Login failed'
      setMessage({ success: false, message: errMsg })
    } finally {
      setIsLoggingIn(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 font-sans p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6 transform transition-all hover:scale-[1.01] duration-300">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">Login </h1>
        <p className="text-center text-gray-500 dark:text-gray-400">Welcome back — please enter your details</p>

        {message && (
          <div className={`p-3 rounded-lg text-center ${message.success ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200' : 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200'}`}>
            {message.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 transition-colors"
            />
          </div>

          <div className="relative">
            <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Password</label>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full pr-10 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 transition-colors"
            />
            <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-1/2 mt-2 -translate-y-1/2 text-gray-500 dark:text-gray-400 focus:outline-none">
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <button type="submit" disabled={isLoggingIn} className={`w-full py-2 px-4 rounded-lg font-semibold transition-all duration-300 ${isLoggingIn ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
            {isLoggingIn ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-gray-500 dark:text-gray-400 mt-4">Don't have an account? <a href="/signup" className="text-blue-600 hover:underline">Create account</a></p>
      </div>

      <AuthImagePattern title="Welcome back" subtitle="Sign in to continue connecting with friends" />
    </div>
  )
}

export default LoginPage