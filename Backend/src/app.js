const express = require("express")
const cookie = require("cookie-parser")
const cors = require("cors")
const path = require('path');

const routes = require("./Routes/app.routes")
const chat = require("./Routes/chat.routes")
const app = express()
app.use(express.json())
app.use(cookie())
app.use(express.static(path.join(__dirname, '../public')));

app.use(cors({
    origin:'https://nexus-ai-two-peach.vercel.app/',
    credentials:true
}))




app.use("/Api/Auth",routes)
app.use("/Api/Chat",chat)
app.get("*name", (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});
module.exports=app
