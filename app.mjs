import session from "express-session";
import connectRedis from "connect-redis";
import redis from "redis";
const RedisStore = connectRedis(session);
const redisClient = redis.createClient();
const sessionMiddleware = session({
  store: new RedisStore({ client: redisClient }),
  secret: "your_secret_key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 1000 * 60 * 60 * 24, 
  },
});

app.use(sessionMiddleware);
