const model = require("../Models/app.model")
const jwt = require("jsonwebtoken")
const crypt = require("bcryptjs")

async function register(req,res){
    const{fullname:{firstName,lastName} ,email ,password}=req.body
    const ifuserexit = await model.findOne({email})
    if(ifuserexit){
        return res.status(401).json({
            message:"Email Already Register"
        })
    }
    const hasing = await crypt.hash(password,10)
    const data = await model.create({
        fullname:{
            firstName,
            lastName
        },
        email,
        password:hasing
    })
    const token = jwt.sign({id:data._id},process.env.jwt)
    res.json({
        data:data,
        token
    })
}

async function login(req,res){
    const {email,password}=req.body
    const ifuserexit = await model.findOne({email})
    if(!ifuserexit){
        return res.json({
            message:"This Mail not register "
        })
    }

    const data = await model.findOne({email})

   const acess = await crypt.compare(password,data.password)
   if(!acess){
    return res.json({
        message:"wrong password"
    })
   }
   const token = jwt.sign({id:data._id},process.env.jwt)
   res.cookie("token",token)
   res.status(200).json({
    message:`Welcome Bro ${data.fullname.firstName} `
   })

}

module.exports = {register,login}
