import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./App.css";

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (username === "admin" && password === "1234") {
      onLogin(true);
      sessionStorage.setItem("auth", "true");
      navigate("/dashboard"); // Redirecionar após login
    } else {
      setError("Usuário ou senha inválidos!");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          className="input-size"
          type="text"
          placeholder="Usuário = admin"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <div className="password-container">
          <input
            className="input-size"
            type={showPassword ? "text" : "password"}
            placeholder="Senha = 1234"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span
            className="password-eye"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
};

export default Login;
