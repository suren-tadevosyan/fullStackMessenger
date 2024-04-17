import React, { useEffect, useState } from "react";
import "./login.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/userSlices";

function LoginPage({ setIsLoggedIn }) {
  const [userId, setId] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post("http://localhost:3001/login", {
        username,
        password,
      });

      if (response.status === 200) {
        console.log(response);
        console.log(userId);
        sessionStorage.setItem("token", response.data.token);
        dispatch(setUser({ username }));
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const registerPage = () => {
    navigate("/registration");
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
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
          Login
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={registerPage}
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
