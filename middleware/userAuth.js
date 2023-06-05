//jshint esversion:6
require("dotenv").config();
const jwt=require("jsonwebtoken");
const bcrypt=require("bcryptjs");

const authorizeUser=(req,res,next)=>{
    try{
        const accessToken=req.headers["authorization"];
        const valToBeVerified=accessToken.split(" ")[1];

        jwt.verify(valToBeVerified,process.env.SECRET_KEY,(err,user)=>{
            if(err){
                res.status(500).json({message:err.message});
            }else{
                if(user.role=="User"){
                    req.user=user;
                    next();
                }
                else{
                    res.status(500).json({message:"Admin Not Authorized to do User Works"});
                }
            }
        });
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
}

module.exports=authorizeUser;