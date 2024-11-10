import React, { useState, FormEvent, useContext, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";

const Register: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { token } = useContext(AuthContext)!;
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate("/dashboard");
    }
  }, [token, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    if (password.length <= 6) {
      alert("Password must be more than 5 characters.");
      return;
    }

    try {
      await axios.post("http://localhost:8000/api/v1/auth/register", {
        username,
        password,
        email,
      });
      alert("Registration successful! You can now log in");
      navigate('/login')
    } catch (error) {
      alert("Registration failed.");
      console.error(error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center justify-center h-screen bg-gray-100"
    >
      <h2 className="text-3xl font-bold mb-6">Register</h2>
      <input
        type="text"
        placeholder="Username"
        onChange={(e) => setUsername(e.target.value)}
        required
        className="mb-4 p-2 border border-gray-300 rounded w-80"
      />
      <input
        type="email"
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
      <button
        type="submit"
        className="bg-blue-500 text-white p-2 rounded w-80 hover:bg-blue-600"
      >
        Register
      </button>
      <Link to="/login" className="mt-4 text-blue-500 hover:underline">
        Already have an account? Log in here.
      </Link>
    </form>
  );
};

export default Register;
