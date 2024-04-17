import React, { useEffect, useState } from "react";
import "./login.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LoginPage from "./login";

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    axios
      .post("http://localhost:3001/register", { username, password })
      .then((response) => {
        console.log("User data saved successfully");

        axios
          .get("http://localhost:3001/users")
          .then((response) => {
            setUsers(response.data);
          })
          .catch((error) => {
            console.error("Error fetching users:", error);
          });
      })
      .catch((error) => {
        console.error("Error saving user data:", error);
      });
  };

  const loginPage = () => {
    navigate("/login");
  };
  return (
    <div className="login-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={handleUsernameChange}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={handlePasswordChange}
            className="form-control"
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Register
        </button>
        <button type="button" className="btn btn-secondary" onClick={loginPage}>
          Sign In
        </button>
      </form>
    </div>
  );
}

export default RegisterPage;
