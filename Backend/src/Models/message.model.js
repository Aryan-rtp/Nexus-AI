const mongoose = require("mongoose")

const schema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
    },
    chat:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"CHAT"
    },
    content:{
        type:String,
        required:true  
     },
    role:{
        type:String,
        enum:["user","model"],
        default:"user"
    }
},{
    timestamps:true
})

const model = mongoose.model("Message",schema)

module.exports=model