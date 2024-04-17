const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const app = express();
const port = 3001;
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
const userSockets = {};

io.on("connection", (socket) => {
  socket.on("set_user_id", (userId) => {
    userSockets[userId] = socket.id;
  });
  console.log("A user connected");

  socket.emit("your id", socket.id);

  socket.on("private_message", (messageObject) => {
    console.log("Received private message:", messageObject);

    console.log(userSockets);
    const receiverSocketId = userSockets[messageObject.receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("message", messageObject);
    } else {
      console.log("Receiver not found or offline");
    }
  });

  socket.on("disconnect", () => {
    const userId = Object.keys(userSockets).find(
      (key) => userSockets[key] === socket.id
    );
    if (userId) {
      delete userSockets[userId];
      console.log(`User ${userId} disconnected`);
    }
  });
});

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  })
);

const db = new sqlite3.Database("./database.db");
const secretKey = crypto
  .createHash("sha256")
  .update("your_secret_key_here")
  .digest("hex");

const activeSessions = {};

db.serialize(() => {
  // db.run("DELETE FROM users", (err) => {
  //   if (err) {
  //     console.error("Error deleting data from users table:", err.message);
  //   } else {
  //     console.log("Data deleted successfully from users table");
  //   }
  // });
  // db.run(
  //   "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT, online BOOLEAN DEFAULT 0)"
  // );
  // db.run(
  //   "INSERT INTO users (username, password, online) SELECT username, password, online FROM users",
  //   (err) => {
  //     if (err) {
  //       console.error("Error copying data to new table:", err.message);
  //     } else {
  //       console.log("Data copied successfully to new table");
  //     }
  //   }
  // );
  // db.run("DROP TABLE IF EXISTS users", (err) => {
  //   if (err) {
  //     console.error("Error dropping old table:", err.message);
  //   } else {
  //     console.log("Old table dropped successfully");
  //   }
  // });
  // db.run("ALTER TABLE users RENAME TO users", (err) => {
  //   if (err) {
  //     console.error("Error renaming new table:", err.message);
  //   } else {
  //     console.log("New table renamed to original table name successfully");
  //   }
  // });
});

// db.run(
//   "ALTER TABLE users ADD COLUMN online BOOLEAN DEFAULT 0;",
//   function (err) {
//     if (err) {
//       console.error("Error adding online column:", err.message);
//     } else {
//       console.log("Online column added successfully");
//     }

//     // Close the database connection
//   }
// );

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

function checkAuth(req, res, next) {
  const token = req.headers.authorization;
  if (!token || !activeSessions[token]) {
    return res.status(401).send("Unauthorized");
  }

  const username = activeSessions[token];
  db.run(
    "UPDATE users SET online = 1 WHERE username = ?",
    [username],
    (err) => {
      if (err) {
        console.error("Error updating online status:", err.message);
      }
    }
  );

  next();
}

app.post("/register", (req, res) => {
  const { username, password } = req.body;

  db.run(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, password],
    (err) => {
      if (err) {
        console.error(err.message);
        res.status(500).send("Error saving user data");
      } else {
        res.status(200).send("User data saved successfully");
      }
    }
  );
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (err) {
      console.error(err.message);
      res.status(500).send("Error checking user");
    } else if (user) {
      if (password === user.password) {
        const token = jwt.sign(
          { username: user.username, userId: user.id },
          secretKey,
          {
            expiresIn: "30m",
          }
        );

        activeSessions[token] = user.username;

        res.status(200).send({ token, userId: user.id });
      } else {
        res.status(401).send("Invalid credentials");
      }
    } else {
      res.status(404).send("User not found");
    }
  });
});

app.post("/logout", (req, res) => {
  const token = req.headers.authorization;
  if (token && activeSessions[token]) {
    delete activeSessions[token];
  }
  res.status(200).send("Logged out successfully");
});

app.get("/users", checkAuth, (req, res) => {
  db.all("SELECT * FROM users", (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).send("Error fetching users");
    } else {
      res.status(200).json(rows);
    }
  });
});

http.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
