const cookie = require("cookie-parser")
const model = require("../Models/app.model")
const jwt =require("jsonwebtoken")
async function check(req,res,next){

    const{token}=req.cookies

    if(!token){
        return res.json({
            message:"Login First"
        })
    }

    const decoder = jwt.verify(token,process.env.jwt)
    const data = await model.findOne({_id:decoder.id})
    req.user = data
    next()
}

module.exports={check}