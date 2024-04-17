import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../redux/userSlices";
import io from "socket.io-client";
import "./chat.css";

const ChatBox = ({ setIsLoggedIn }) => {
  const dispatch = useDispatch();
  const [selectedUser, setSelectedUser] = useState(null);

  const username = useSelector((state) => state.user.username);
  const userId = useSelector((state) => state.user.id);

  const [yourID, setYourID] = useState();
  const [allUsers, setAllUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [uniqueMessages, setUniqueMessages] = useState([]);

  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io.connect("http://localhost:3001");

    socketRef.current.on("connect", () => {
      socketRef.current.emit("set_user_id", userId);
    });
    socketRef.current.on("your id", (id) => {
      setYourID(id);
    });

    socketRef.current.on("message", (message) => {
      console.log(1);
      receivedMessage(message);
    });
  }, [userId]);

  useEffect(() => {
    console.log(messages);
  }, [messages]);

  function receivedMessage(message) {
    setMessages((oldMsgs) => [...oldMsgs, message]);
  }

  const handleUserClick = async (clickedUser) => {
    setSelectedUser(clickedUser);
  };
  const handleSendMessage = async () => {
    const messageObject = {
      body: message,
      senderId: userId,
      receiverId: selectedUser.id,
    };
    setMessages((oldMsgs) => [...oldMsgs, messageObject]);
    await socketRef.current.emit("private_message", messageObject);

    setMessage("");
  };
  function handleChange(e) {
    setMessage(e.target.value);
  }

  useEffect(() => {
    const checkTokenValidity = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setIsLoggedIn(false);
        return;
      }

      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        sessionStorage.removeItem("token");
        setIsLoggedIn(false);
      } else {
        setIsLoggedIn(true);

        try {
          const response = await axios.get("http://localhost:3001/users", {
            headers: { Authorization: token },
          });

          const users = response.data.filter(
            (user) => user.username !== decodedToken.username
          );
          setAllUsers(users);
          const user = response.data.find(
            (user) => user.username === decodedToken.username
          );
          if (user) {
            dispatch(setUser({ username: user.username, userId: user.id }));
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    checkTokenValidity();
  }, [dispatch, setIsLoggedIn]);

  return (
    <div>
      <div>Welcome, {username}!</div>

      <div>Other users:</div>

      <ul className="user-list">
        {allUsers.length > 0 &&
          allUsers.map((user) => (
            <li
              className="user-list-item"
              key={user.id}
              onClick={() => handleUserClick(user)}
            >
              {user.username}
            </li>
          ))}
      </ul>
      {selectedUser && (
        <div className="">
          <h2>Chatting with {selectedUser.username}</h2>
          <div>
            <ul className="box">
              {console.log(messages)}
              {messages.map(
                (message, index) =>
                  message.receiverId === userId &&
                  message.senderId === selectedUser.id && (
                    <li
                      key={index}
                      className={
                        message.receiverId === userId
                          ? "message outgoing"
                          : "message incoming"
                      }
                    >
                      {message.body}
                    </li>
                  )
              )}
            </ul>
            <input
              type="text"
              placeholder="Type your message"
              value={message}
              onChange={handleChange}
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
