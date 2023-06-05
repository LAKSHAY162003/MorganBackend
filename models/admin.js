const mongoose =require("mongoose");

const adminSchema=new mongoose.Schema({
    username:String,
    password:String,
    _id:String // generate using uuvid() only !! 
});

// admin schema needs to be different because all the details of the user 
// schema are of no use for admin !! 
const Admin=mongoose.model("admin",adminSchema);

module.exports =Admin;