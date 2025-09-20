import React, { use, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingPage from "./pages/SettingPage";
import ProfilePage from "./pages/ProfilePage";
import Navbar from "./components/Navbar";
import { useAuthStore } from "./store/useAuthStore";
import { Loader } from "lucide-react";
import { useThemeStore } from "./store/useThemeStore";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
const {theme} = useThemeStore()


  useEffect(() => {
    checkAuth();
  }, [checkAuth]);


  if (isCheckingAuth)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <div data-theme = {theme}>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route path="/setting" element={<SettingPage />} />
        <Route
          path="/profile"
          element={authUser ? <ProfilePage /> : <Navigate to="login" />}
        />
      </Routes>
    </div>
  );
};

export default App;
