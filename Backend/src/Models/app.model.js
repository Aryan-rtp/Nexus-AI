const mongoose = require("mongoose")

const schema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    fullname:{
        firstName:{
            type:String,
            required:true,
            trim: true
        },
        lastName:{
            type:String,
            required:true,
            trim: true
        }
    },
    password:{
        type:String,
    }
},
{
    timestamps:true
})

const model = mongoose.model("user",schema)

module.exports=model