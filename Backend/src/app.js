const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");

const routes = require("./Routes/app.routes");
const chat = require("./Routes/chat.routes");

const app = express();

/* -------------------- CORS -------------------- */
const allowedOrigins = [
  "http://localhost:5173",
  "https://nexus-ai-two-peach.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

/* -------------------- Middlewares -------------------- */
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));

/* -------------------- Routes -------------------- */
app.use("/Api/Auth", routes);
app.use("/Api/Chat", chat);

/* -------------------- SPA Fallback -------------------- */
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

module.exports = app;
