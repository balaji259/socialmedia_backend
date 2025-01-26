const express=require('express');
const router=express.Router();

const User=require("../models/users");

const cloudinary = require('../cloudinaryConfig');
const Message=require("../models/message");
const authenticateUser=require("./authenticate_user");

const { getReceiverSocketId,io } = require("../socket");  // Adjust path if necessary




const getUsersForSideBar=async (req,res)=>{
    try{
        const loggedInUserId=req.user.userId;
        console.log("loggedInUserId");
        console.log(loggedInUserId);
        // const filteredUsers=await User.find({ _id: { $ne: loggedInUserId }}).select("-password");
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("_id username fullname email profilePic bio");
        // console.log("filteredUsers");
        // console.log(filteredUsers);

        res.status(200).json(filteredUsers);

    }
    catch(e)
    {
        console.log(e);
        // res.status(500).json({error:"Internal server error!"});
        res.status(500).json(e);
    }
};
 
const getMessages=async (req,res)=>{
    try{
        const {id:userToChatId}=req.params;
        const myId=req.user.userId;
        console.log(myId);
        console.log(userToChatId);

        const messages=await Message.find({
            $or:[
                {senderId:myId, receiverId:userToChatId},
                {senderId:userToChatId, receiverId:myId}
            ]
            })
            res.status(200).json(messages);
        }
        catch(e){
            console.log(e);
            res.status(500).json({error:"Internal Server Error"});
        }
}


const sendMessage=async (req,res)=>{
    try{
        // const {text,image}=req.body;
        const { text, media, mediaType } = req.body;
        const {id:receiverId}=req.params;
        const senderId= req.user.userId;

        let mediaUrl;
        if(media){
            const uploadResponse = await cloudinary.uploader.upload(media, {
                resource_type: mediaType === "video" ? "video" : "image",
            });
            mediaUrl = uploadResponse.secure_url;
        }

        const newMessage=new Message(
            {
                senderId,
                receiverId,
                text,
                media: mediaUrl,
                mediaType,
            }
        ); 

        await newMessage.save();

        //real time functinlity goes here!
        const receiverSocketId = getReceiverSocketId(receiverId);
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage",newMessage);
        }


        res.status(201).json(newMessage);

    }
    catch(e){
        console.log(e);
        res.status(500).json("Error in sending message",e.message);
    }
};  



//routers

router.get("/get/:id",authenticateUser,getMessages);
router.post("/send/:id",authenticateUser,sendMessage);
router.get("/getusers",authenticateUser,getUsersForSideBar);

module.exports=router;