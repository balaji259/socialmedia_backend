const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/users'); // Make sure this points to your User model
const { getRandomUserSuggestions,getSearchSuggestions } = require('./suggestions');
const authenticateUser=require("./authenticate_user");
const { checkStreakOnLoad, updateStreakOnPost } =require("./streak");

const router = express.Router();



// Middleware to fetch user details
const getUserDetails = async (req, res) => {
  try {

   
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header is missing' });
    }

    // Split the header to extract the token
    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      return res.status(401).json({ message: 'Invalid Authorization format' });
    }

    // Extract the token
    const token = tokenParts[1];

    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET); // Ensure JWT_SECRET is set correctly
    } catch (err) {
      return res.status(401).json({ message: 'Token verification failed', error: err.message });
    }

    // Fetch the user from the database
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send relevant user data
    res.json({
      username: user.username,
      fullname: user.fullname,
      profilePic: user.profilePic,
    });
  } catch (err) {
    // Catch any server errors
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};



async function followUser(req, res) {
  const { userId, targetId: followId } = req.body;
  // const followId=req.body.targetId;

  console.log({userId,followId});

  try {
    const user = await User.findById(userId);
    const followUser = await User.findById(followId);

    if (!user || !followUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already followed
    if (user.following.includes(followId)) {
      return res.status(400).json({ message: 'Already following' });
    }

    // Update the follower and following lists
    user.following.push(followId);
    followUser.followers.push(userId);

    // Check if mutual following exists
    if (followUser.following.includes(userId)) {
      // Add to each other's friends list
      if (!user.friends.includes(followId)) {
        user.friends.push(followId);
      }
      if (!followUser.friends.includes(userId)) {
        followUser.friends.push(userId);
      }
    }

    console.log("implemented friends feature !");
    await user.save();
    await followUser.save();

    res.status(200).json({ message: 'Followed successfully and friends list updated if mutual' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}


async function unfollowUser(req, res) {
  const { userId } = req.body;
  const unfollowId=req.body.targetId;
  console.log({ userId, unfollowId })

  try {
    console.log("in unfollow")
    const user = await User.findById(userId);
    const unfollowUser = await User.findById(unfollowId);

    if (!user || !unfollowUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user is currently following the unfollowed user
    if (!user.following.includes(unfollowId)) {
      return res.status(400).json({ message: 'Not following the user' });
    }

    // Remove the unfollowed user from the current user's following list
    user.following = user.following.filter((id) => id.toString() !== unfollowId);

    // Remove the current user from the unfollowed user's followers list
    unfollowUser.followers = unfollowUser.followers.filter((id) => id.toString() !== userId);

    // If they were friends (mutual followers), remove each other from friends lists
    if (user.friends.includes(unfollowId)) {
      user.friends = user.friends.filter((id) => id.toString() !== unfollowId);
    }
    if (unfollowUser.friends.includes(userId)) {
      unfollowUser.friends = unfollowUser.friends.filter((id) => id.toString() !== userId);
    }

    await user.save();
    await unfollowUser.save();

    res.status(200).json({ message: 'Unfollowed successfully and friends list updated if necessary' });
  } catch (error) {
    console.error('Error during unfollow:', error);
    res.status(500).json({ message: 'Server error', error });
  }
}



//  async function followUser(req, res){
//     const { userId, followId } = req.body;
//     try {
//         const user = await User.findById(userId);
//         const followUser = await User.findById(followId);

//         if (!user || !followUser) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Check if already followed
//         if (user.following.includes(followId)) {
//             return res.status(400).json({ message: 'Already following' });
//         }

//         // Update the follower lists
//         user.following.push(followId);
//         followUser.followers.push(userId);

//         await user.save();
//         await followUser.save();

//         res.status(200).json({ message: 'Followed successfully' });
//     } catch (error) {
//         res.status(500).json({ message: 'Server error', error });
//     }
// };


router.post("/search/followsug",async(req,res)=>{
  const { userId, followId } = req.body;
  // const followId=req.body.targetId;

  console.log({userId,followId});

  try {
    const user = await User.findById(userId);
    const followUser = await User.findById(followId);

    if (!user || !followUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already followed
    if (user.following.includes(followId)) {
      return res.status(400).json({ message: 'Already following' });
    }

    // Update the follower and following lists
    user.following.push(followId);
    followUser.followers.push(userId);

    // Check if mutual following exists
    if (followUser.following.includes(userId)) {
      // Add to each other's friends list
      if (!user.friends.includes(followId)) {
        user.friends.push(followId);
      }
      if (!followUser.friends.includes(userId)) {
        followUser.friends.push(userId);
      }
    }

    console.log("implemented friends feature !");
    await user.save();
    await followUser.save();

    res.status(200).json({ message: 'Followed successfully and friends list updated if mutual' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
})




// Define the route

//follow
router.post('/follow/:userId', authenticateUser, async (req, res) => {
  try {
      const currentUserId = req.user.userId; // Current user ID from token
      const targetUserId = req.params.userId; // User ID of the person to follow

      if (currentUserId === targetUserId) {
          return res.status(400).json({ message: 'You cannot follow yourself' });
      }

      const currentUser = await User.findById(currentUserId);
      const targetUser = await User.findById(targetUserId);

      if (!currentUser || !targetUser) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Check if already following
      if (!currentUser.following.includes(targetUserId)) {
          currentUser.following.push(targetUserId);
          targetUser.followers.push(currentUserId);

          await currentUser.save();
          await targetUser.save();

          return res.status(200).json({ message: 'Successfully followed user' });
      } else {
          return res.status(400).json({ message: 'Already following user' });
      }
  } catch (error) {
      console.error('Follow error:', error);
      res.status(500).json({ message: 'Failed to follow user' });
  }
});


//get friends
router.get('/:userId/friends', async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).populate('friends', 'username fullname profilePic bio');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ friends: user.friends });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Example Express.js route
router.post('/getUsersByIds', async (req, res) => {
  const { userIds } = req.body;
  try {
      const users = await User.find({ _id: { $in: userIds } }).select('username'); // Fetch only usernames
      res.json(users);
  } catch (error) {
      res.status(500).json({ message: 'Error fetching users' });
  }
});

// async function getUserProfile(req,res){
//     try{
//         const {userId} =req.params;
//         const userProfile=await User.findById(userId).select('-password');
//         if(!userProfile)
//             return res.status(404).json({message:'User not found'});
//         res.status(200).json(userProfile);   
//     } 
//     catch(e){
//       console.log(e);
//       res.status(500).json({message: 'Server error!'})
//     }
// }

async function getUserProfile(req, res) {
  try {
    const { userId } = req.params;

    // Use `populate` to fetch the bestFriend details
    const userProfile = await User.findById(userId)
      .select('-password') // Exclude the password field
      .populate({
        path: 'bestFriend',   // Populate the bestFriend field
        select: 'username',   // Only fetch the username of the bestFriend
      });

    if (!userProfile) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(userProfile);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error!' });
  }
}


async function getUser(req,res){
  try{
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header is missing' });
    }

    // Split the header to extract the token
    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      return res.status(401).json({ message: 'Invalid Authorization format' });
    }

    // Extract the token
    const token = tokenParts[1];

    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET); // Ensure JWT_SECRET is set correctly
    } catch (err) {
      return res.status(401).json({ message: 'Token verification failed', error: err.message });
    }

    // Fetch the user from the database
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send relevant user data
    res.json({
      userId:user._id,
      username: user.username,
      email:user.email,
      // fullname: user.fullname,
      // profilePic: user.profilePic,
    });
  } catch (err) {
    // Catch any server errors
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

router.post('/check-email', async (req, res) => {
  const { email } = req.body;
  try {
      const user = await User.findOne({ email }); // Replace with your DB logic
      if (user) {
          return res.json({ exists: true });
      }
      res.json({ exists: false });
  } catch (err) {
      console.error('Error checking email:', err);
      res.status(500).json({ error: 'Internal server error' });
  }
});





router.get('/getdetails', getUserDetails);
router.get('/suggestions',authenticateUser,getRandomUserSuggestions);
router.get('/search/suggestions',authenticateUser,getSearchSuggestions);
router.post('/search/follow',followUser);
router.post('/search/unfollow',unfollowUser);
router.get('/viewProfile/:userId',getUserProfile);
router.get('/getuser',getUser);

module.exports = router;

