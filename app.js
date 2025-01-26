const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const verifyToken =require("./middleware/verify.js");
const connectDB = require('./db/db');
const authRouter = require('./routes/auth');
const postRouter=require("./routes/postRoutes");
const userRouter=require("./routes/user")
const profileRouter=require("./routes/profile");
const streakRouter=require('./routes/streak');
const chatRouter=require("./routes/message");
// const otpRoutes = require('./routes/otpRoutes')

const {app,server} =require("./socket.js");

const cors = require('cors');



// const upload = require('./routes/upload'); // Import upload middleware
require('dotenv').config();

// const app = express();

app.use(express.json({ limit: '50mb' })); // Set limit to 10 MB
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '..','frontend','dist')));



// app.use(cors(*));

app.use(
  cors({
    origin: "*", // Your deployed frontend URL
    methods: ["GET", "POST","PUT","PATCH","DELETE"],
  })
);

connectDB();

// Routes
app.use('/user', authRouter);
app.use('/posts',postRouter);
app.use('/user',userRouter);
app.use('/profile',profileRouter);
app.use('/streak',streakRouter);
app.use('/messages',chatRouter);


app.get('/verify',verifyToken,(req,res)=>{
  console.log("Token Verified");
  res.status(200).json({
    message:"Token Verified",
    token:req.token,
    user:req.user
  })
});

app.get('*',(req,res)=>{
  res.sendFile(path.join(__dirname,'..','frontend','dist','index.html'));
})


// Start the server
const PORT = 7000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
