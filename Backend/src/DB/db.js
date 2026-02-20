const mongoose = require("mongoose")

async function connectToDB(){
    try{
        await mongoose.connect(process.env.MONGOO)
        console.log("CONNECT TO MONGOO")
    }
    catch(err){
        console.log("SOME THING IS WRONG "+err)
    }
}

module.exports=connectToDB