import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import AuthImagePattern from "../components/AuthImagePattern";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState(null);

  // Destructure state and actions from the Zustand store.
  const { signUp, isSigningUp } = useAuthStore();
  const navigate = useNavigate();

  // Handle input changes and update the form data state.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    const result = await signUp(formData);
    setMessage(result);
    if (result.success) {
      navigate("/");
    }
  };

  const eyeIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-5 h-5"
    >
      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
      <path
        fillRule="evenodd"
        d="M1.323 11.447C2.811 6.976 7.027 3.75 12.001 3.75c4.975 0 9.19 3.226 10.675 7.697a1.5 1.5 0 010 1.106C21.19 17.024 16.974 20.25 12 20.25c-4.974 0-9.19-3.226-10.675-7.697a1.5 1.5 0 010-1.106zM12 18.75a6.75 6.75 0 100-13.5 6.75 6.75 0 000 13.5z"
        clipRule="evenodd"
      />
    </svg>
  );

  const eyeSlashIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-5 h-5"
    >
      <path
        d="M3.5 2.5a.5.5 0 00-1 0v.5a.5.5 0 001 0v-.5zM2.5 3.5a.5.5 0 00-.5.5v.5a.5.5 0 001 0v-.5a.5.5 0 00-.5-.5zM2.5 20.5a.5.5 0 00.5-.5v-.5a.5.5 0 00-1 0v.5a.5.5 0 00.5.5zM3.5 21.5a.5.5 0 001 0v-.5a.5.5 0 00-1 0v.5zM20.5 21.5a.5.5 0 00.5-.5v-.5a.5.5 0 00-1 0v.5a.5.5 0 00.5.5zM21.5 20.5a.5.5 0 00-.5-.5v-.5a.5.5 0 001 0v.5a.5.5 0 00-.5.5zM21.5 3.5a.5.5 0 00-.5-.5v-.5a.5.5 0 00-1 0v.5a.5.5 0 00.5.5zM20.5 2.5a.5.5 0 00-.5.5v.5a.5.5 0 001 0v-.5a.5.5 0 00-.5-.5z"
        fillRule="evenodd"
        clipRule="evenodd"
      />
      <path
        d="M2 12c0-1.428.188-2.825.54-4.152l3.415 3.415a3 3 0 014.544-4.544L12 3.54c1.327-.352 2.724-.54 4.152-.54L15 2.5a.5.5 0 00-1 0v.5a.5.5 0 001 0v-.5h2.5a.5.5 0 000-1H15a.5.5 0 00-1 0v.5a.5.5 0 001 0v-.5H7.5a.5.5 0 000 1h2.5a.5.5 0 001 0v-.5a.5.5 0 00-1 0v.5h-2.5a.5.5 0 000-1zm14.5 10a.5.5 0 00-.5-.5h-2.5a.5.5 0 000 1h2.5a.5.5 0 00.5-.5zM7.5 21.5a.5.5 0 000-1h-2.5a.5.5 0 00-.5.5v2.5a.5.5 0 001 0v-2.5a.5.5 0 00-.5-.5z"
        fillRule="evenodd"
        clipRule="evenodd"
      />
      <path
        d="M12 15a3 3 0 100-6 3 3 0 000 6z"
        fillRule="evenodd"
        clipRule="evenodd"
      />
      <path
        fillRule="evenodd"
        d="M21.75 11.447a1.5 1.5 0 010 1.106c-1.488 4.471-5.704 7.697-10.679 7.697-1.5 0-2.956-.25-4.32-.732l.859-.858a9.75 9.75 0 0010.518-7.907.75.75 0 01.75-.75h2.25a.75.75 0 00.75-.75zM12 20.25a6.75 6.75 0 100-13.5 6.75 6.75 0 000 13.5z"
        clipRule="evenodd"
      />
    </svg>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 font-sans p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6 transform transition-all hover:scale-[1.01] duration-300">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
          Create an Account
        </h1>
        <p className="text-center text-gray-500 dark:text-gray-400">
          Join us and start your journey
        </p>

        {/* Display success or error messages */}
        {message && (
          <div
            className={`p-3 rounded-lg text-center ${
              message.success
                ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200"
                : "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200"
            }`}
          >
            {message.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name Input */}
          <div>
            <label
              htmlFor="fullName"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1"
            >
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 transition-colors"
              required
            />
          </div>

          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 transition-colors"
              required
            />
          </div>

          {/* Password Input with Visibility Toggle */}
          <div className="relative">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1"
            >
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full pr-10 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 transition-colors"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 mt-2 -translate-y-1/2 text-gray-500 dark:text-gray-400 focus:outline-none"
            >
              {showPassword ? eyeSlashIcon : eyeIcon}
            </button>
          </div>

          {/* Sign Up Button */}
          <button
            type="submit"
            className={`w-full py-2 px-4 rounded-lg font-semibold transition-all duration-300 ${
              isSigningUp
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            }`}
            disabled={isSigningUp}
          >
            {isSigningUp ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
        {/* Login Link */}
        <p className="text-center text-gray-500 dark:text-gray-400 mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Login
          </a>
        </p>
      </div>
      <AuthImagePattern
        title="Join our community"
        subtitle="connect with friends, share momonts, and stay in touch with your loved ones"
      />
    </div>
  );
};

export default SignUpPage;
