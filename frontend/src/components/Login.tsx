// src/components/Login.tsx
import React, { useContext, useState, FormEvent, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { login, token } = useContext(AuthContext)!;
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate("/dashboard");
    }
  }, [token, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post<{ token: string }>(
        "http://localhost:8000/api/v1/auth/login",
        { email, password }
      );
      login(res.data.token);
      navigate("/dashboard");
    } catch (error) {
      alert("Login failed. Please check your credentials.");
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h2 className="text-3xl font-bold mb-6">Login</h2>
      <input
        type="text"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
        required
        className="mb-4 p-2 border border-gray-300 rounded w-80"
      />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
        required
        className="mb-4 p-2 border border-gray-300 rounded w-80"
      />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded w-80 hover:bg-blue-600">
        Login
      </button>
      <Link to="/register" className="mt-4 text-blue-500 hover:underline">
        Don't have an account? Register here
      </Link>
    </form>
  );
};

export default Login;
