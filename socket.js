//socket.js

const {Server} = require("socket.io");
const http=require("http");
const express=require("express");

const app=express();
const server=http.createServer(app);

const io=new Server(server,{
    cors:{
        origin:"*",
        methods: ["GET", "POST"],
    }
});

function getReceiverSocketId(userId) { 
    return userSocketMap[userId];
}

//used to store online users
const userSocketMap={}; //{userId:socketId};

io.on("connection", (socket) => {
    
    console.log("A user connected:", socket.id);

    const userId=socket.handshake.query.userId;  

    if (!userId) {
        console.warn("Connection attempt with missing userId:", socket.id);
        // return;
      }


      if (!userSocketMap[userId]) {
        userSocketMap[userId] = [];
      }
    
      userSocketMap[userId].push(socket.id);

    // if(userId)
    //     userSocketMap[userId]=socket.id;

    io.emit("getOnlineUsers",Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
        // delete userSocketMap[userId];
        // io.emit("getOnlineUsers",Object.keys(userSocketMap)); 

        if (userSocketMap[userId]) {
            userSocketMap[userId] = userSocketMap[userId].filter(
              (id) => id !== socket.id
            );
      
            // If no sockets are left for the user, remove the user from the map
            if (userSocketMap[userId].length === 0) {
              delete userSocketMap[userId];
            }
          }
      
          // Emit updated online users
          io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

module.exports= {io, app, server,getReceiverSocketId}; 