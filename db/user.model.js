const  mongoose = require("mongoose");
const validator= require('validator')
const userSchema = new mongoose.Schema({
    username : {
        type : String,
        required : true,
    },
    email : {
        type : String,
        required : true,
        unique : true,
        validate : [validator.isEmail , "filed must be a vaild Email"]
    },
    password : {
        type : String,
        required : true
    },
    age : {
        type : Number,
        required : true
    },
    gender :{
        type : String,
        enum : ["female" , "male"],
        required : true,
    },
    role : {
        type : String, // ['user' , 'admin' , 'manger']
        enum : ["user" , "admin" , "manager"],
        default : "user"
    },
   token:{
    type : String
   },
   profile:{
    type: String,
    default:'uploads/profile/user.png'
   }

})

module.exports = mongoose.model("User" , userSchema)
