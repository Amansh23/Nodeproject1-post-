const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");


mongoose.connect("mongodb://localhost/login");

const userSchema = mongoose.Schema({
    name:String,
    username:String,
    password:String,
    File:{
        type:String,
        default:""
    },
    posts:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"post"
    }],
    likes:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"post"
    }
});

userSchema.plugin(plm);

module.exports = mongoose.model("user",userSchema);