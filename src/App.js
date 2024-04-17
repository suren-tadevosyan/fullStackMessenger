import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import "./App.css";
import LoginPage from "./components/Login/login";
import RegisterPage from "./components/Login/register";
import ChatBox from "./components/chatBox/chat";
import { useEffect, useState } from "react";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      navigate("/chatBox");
    } else {
      setIsLoggedIn(false);
    }
  }, [isLoggedIn]);

  return (
    <div className="App">
      <Routes>
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Navigate to="/chatBox" />
            ) : (
              <LoginPage setIsLoggedIn={setIsLoggedIn} />
            )
          }
        />
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/chatBox" />
            ) : (
              <LoginPage setIsLoggedIn={setIsLoggedIn} />
            )
          }
        />
        <Route
          path="/registration"
          element={
            isLoggedIn ? (
              <Navigate to="/chatBox" />
            ) : (
              <RegisterPage setIsLoggedIn={setIsLoggedIn} />
            )
          }
        />
        <Route
          path="/chatbox"
          element={
            isLoggedIn ? (
              <ChatBox setIsLoggedIn={setIsLoggedIn} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </div>
  );
}

export default App;
