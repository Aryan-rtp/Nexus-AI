const express = require("express")
const {check} = require("../Middlewares/Auth.middleware")
const chatController = require("../Controllers/Chat.controller")

const Router = express.Router()

Router.post("/",check,chatController.chat)

/* GET /api/chat/ */
Router.get('/', check, chatController.getChats)


/* GET /api/chat/messages/:id */
Router.get('/messages/:id', check, chatController.getMessages)
module.exports=Router