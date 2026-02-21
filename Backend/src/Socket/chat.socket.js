const { Server } = require("socket.io");
const { aiservice, generateVector } = require("../Service/Ai.service")
const jwt = require("jsonwebtoken")
const userModel = require("../Models/app.model")
const chatmeaage = require("../Models/message.model")
const cookie = require("cookie")
const { createMemory, queryMemory } = require("../Service/Vector.service")
async function initsocketio(httpServer) {

  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true
    }
  });

  io.use(async (socket, next) => {

    const cookies = cookie.parse(socket.handshake.headers?.cookie || "")
    if (!cookies) {
      next(new Error("Authentication Error : Token not find "))
    }

    try {
      const decoded = jwt.verify(cookies.token, process.env.jwt)
      const user = await userModel.findById(decoded.id)
      socket.user = user
      next()

    } catch (error) {
      next(new Error(`Some thing is wrong ${error}`))
    }

  })


  io.on("connection", (socket) => {

    console.log("USER CONNECT " + socket.user)

    socket.on("message", async (data) => {


      const [chatdata, vectors] = await Promise.all([

        await chatmeaage.create({
          user: socket.user._id,
          chat: data.chat,
          content: data.content,
          role: "user"

        }),
        await generateVector(data.content)
      ])


      if (!vectors || vectors.length === 0) {
        console.log("Vector generation failed");
        return;
      }

      const memory = await queryMemory({
        queryVector: vectors,
        limit: 3,
        metadata: {
          user_ID: socket.user._id
        }
      })


      const [chatHistory] = await Promise.all([
        (await chatmeaage.find({
          chat: data.chat
        }).sort({ createdAt: -1 }).limit(20).lean()).reverse(),

        await createMemory({

          vectors: vectors,
          messageId: chatdata._id,
          metadata: ({
            chat: data.chat,
            user_ID: socket.user._id,
            content: data.content,
            content_role: chatdata.role
          })
        })


      ])





      const stm = chatHistory.filter(item => { return item.user.toString() == socket.user._id }).map(item => {
        return {
          role: item.role,
          parts: [{ text: item.content }]
        }
      })


      const ltm = [{


        role: "user",
        parts: [{
          text: `You are an AI assistant.

Use the previous conversation history and stored memory data to generate a personalized and context-aware response.

The user's first name is: ${socket.user.fullname.firstName}

Here is relevant memory from previous chats:
${memory.map(item => item.metadata.content).join("\n")}

Instructions:
- Personalize the response using the user's name naturally.
- Use previous memory only if it is relevant to the current query.
- Do not explicitly mention "memory" or "previous data" in your response.
- Keep the response natural, helpful, and conversational.
- Avoid repeating old information unless necessary.
- Maintain clarity and precision.
 `
        }]
      }]


      const responce = await aiservice([...ltm, ...stm])

      socket.emit("AI-MESSAGE", responce)

      const [responcevector, aidata] = await Promise.all([

        await generateVector(responce),

        await chatmeaage.create({
          user: socket.user._id,
          chat: data.chat,
          content: responce,
          role: "model"

        })
      ])

      await createMemory({

        vectors: responcevector,
        messageId: aidata._id,
        metadata: ({
          chat: data.chat,
          user_ID: socket.user._id,
          content: responce,
          content_Id: aidata.role

        })
      })
    })

  });


}



module.exports = initsocketio