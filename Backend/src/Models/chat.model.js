const mogoose = require("mongoose")

const schema = new mogoose.Schema({
    user:{
        type:mogoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    title:{
        type:String,
        required:true
    },
    LastActivity:{
        type:Date,
        default:Date.now
    }
})

const model = mogoose.model("CHAT",schema)

module.exports=model