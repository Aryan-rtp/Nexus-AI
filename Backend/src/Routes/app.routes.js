const express = require("express")
const {register,login} = require("../Controllers/Auth.controller")
const {check} = require("../Middlewares/Auth.middleware")
const routes = express.Router()

routes.post("/register",register)
routes.post("/login",login)
routes.get("/check",check,(req,res)=>{
    res.json({
        data:req.user
    })
})

routes.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
});

module.exports = routes