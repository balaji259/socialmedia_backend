const express = require('express');
const router = express.Router();

const User = require('../models/users'); // Adjust the path as needed

// Function to get the top 10 users by streak count
const getTopStreakUsers = async (req, res) => {
  try {
    console.log("called");
    const topStreakUsers = await User.find()
      .sort({ 'streak.count': -1 }) // Sort by streak count in descending order
      .limit(10) // Limit to top 10 users
      .select('profilePic username streak.count'); // Select only the necessary fields
// 
    // console.log("top streak users");
    // console.log(topStreakUsers);
    res.status(200).json(topStreakUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching top streak users' });
  }
};

// Define route to get top streak users
router.get('/top-streaks', getTopStreakUsers);

module.exports = router;