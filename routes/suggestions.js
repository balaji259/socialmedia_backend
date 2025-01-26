const User = require('../models/users'); // Adjust the path as needed
const authenticateUser = require('./authenticate_user');

// Function to get random users excluding those who are followed by the logged-in user and excluding the user themself
// async function getRandomUserSuggestions(req, res) {
//     try {
//         const loggedInUserId = req.user.userId; // Ensure we are using req.user.userId from the decoded token

//         if (!loggedInUserId) {
//             return res.status(400).json({ message: 'User not authenticated' });
//         }

//         // Fetch the logged-in user with their following list
//         const loggedInUser = await User.findById(loggedInUserId).populate('following');
//         if (!loggedInUser) {
//             return res.status(404).json({ message: 'Logged-in user not found' });
//         }

//         // Create an array of IDs to exclude: logged-in user + users they are following
//         const excludeIds = loggedInUser.following.map(user => user._id.toString());
//         excludeIds.push(loggedInUserId.toString()); // Add logged-in user's ID to exclusion list

//         // Fetch random users excluding those in the excludeIds array
//         const randomUsers = await User.aggregate([
//             { $match: { _id: { $nin: excludeIds } } }, // Exclude followed users and self
//             { $sample: { size: 5 } } // Get 5 random users
//         ]);

//         // Ensure logged-in user's ID is not included
//         const filteredUsers = randomUsers.filter(user => user._id.toString() !== loggedInUserId.toString());

//         res.status(200).json({ users: filteredUsers.slice(0, 3) });
//     } catch (error) {
//         console.error('Error fetching user suggestions:', error); // Log the error
//         res.status(500).json({ message: 'Something went wrong', error: error.message });
//     }
// }


// async function getRandomUserSuggestions(req, res) {
//     try {
//         const loggedInUserId = req.user.userId;

//         if (!loggedInUserId) {
//             return res.status(400).json({ message: 'User not authenticated' });
//         }

//         // Fetch the logged-in user's following list
//         const loggedInUser = await User.findById(loggedInUserId).populate('following');
//         if (!loggedInUser) {
//             return res.status(404).json({ message: 'Logged-in user not found' });
//         }

//         // Create an exclusion list with the logged-in user's ID and their following list
//         const excludeIds = loggedInUser.following.map(user => user._id);
//         excludeIds.push(loggedInUser._id);

//         // Aggregate to fetch random users excluding those in the excludeIds array
//         const randomUsers = await User.aggregate([
//             { $match: { _id: { $nin: excludeIds } } }, // Exclude followed users and self
//             { $sample: { size: 3 } }, // Directly limit to 3 random users
//             { $project: { password: 0 } } // Exclude sensitive information
//         ]);

//         res.status(200).json({ users: randomUsers });
//     } catch (error) {
//         console.error('Error fetching user suggestions:', error);
//         res.status(500).json({ message: 'Something went wrong', error: error.message });
//     }
// }

async function getRandomUserSuggestions(req, res) {
    try {
        const loggedInUserId = req.user.userId;

        if (!loggedInUserId) {
            return res.status(400).json({ message: 'User not authenticated' });
        }

        // Fetch the logged-in user's following list
        const loggedInUser = await User.findById(loggedInUserId).populate('following');
        if (!loggedInUser) {
            return res.status(404).json({ message: 'Logged-in user not found' });
        }

        // Create an exclusion list with the logged-in user's ID and their following list
        const excludeIds = loggedInUser.following.map(user => user._id);
        excludeIds.push(loggedInUser._id);

        // Fetch all users excluding those in the excludeIds array
        const allSuggestions = await User.aggregate([
            { $match: { _id: { $nin: excludeIds } } }, // Exclude followed users and self
            { $project: { password: 0 } } // Exclude sensitive information
        ]);

        res.status(200).json({ users: allSuggestions });
    } catch (error) {
        console.error('Error fetching user suggestions:', error);
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
}


// async function getSearchSuggestions(req, res) {
//     try {
//         const loggedInUserId = req.user.userId;
//         console.log(loggedInUserId);
//         const { query = '', page = 1, limit = 9 } = req.query; // Default limit is 9 for 3 rows

//         if (!loggedInUserId) {
//             return res.status(400).json({ message: 'User not authenticated' });
//         }

//         const loggedInUser = await User.findById(loggedInUserId).populate('following');
//         if (!loggedInUser) {
//             return res.status(404).json({ message: 'Logged-in user not found' });
//         }

//         const excludeIds = loggedInUser.following.map(user => user._id);
//         excludeIds.push(loggedInUser._id);

//         const matchQuery = {
//             _id: { $nin: excludeIds },
//             username: { $regex: query, $options: 'i' } // Case-insensitive search by username
//         };

//         const users = await User.find(matchQuery)
//             .skip((page - 1) * limit)
//             .limit(limit)
//             .select('-password');

//         console.log(users);

//         res.status(200).json({ users });
//     } catch (error) {
//         console.error('Error fetching user suggestions:', error);
//         res.status(500).json({ message: 'Something went wrong', error: error.message });
//     }
// }

async function getSearchSuggestions(req, res) {
    try {
        const loggedInUserId = req.user.userId; // Assuming user ID is available in req.user
        console.log(loggedInUserId);
        const { query = '', page = 1, limit = 9 } = req.query; // Default limit is 9 for 3 rows

        if (!loggedInUserId) {
            return res.status(400).json({ message: 'User not authenticated' });
        }

        const loggedInUser = await User.findById(loggedInUserId);
        if (!loggedInUser) {
            return res.status(404).json({ message: 'Logged-in user not found' });
        }

        const excludeIds = [loggedInUser._id]; // Exclude the logged-in user's ID

        const matchQuery = {
            _id: { $nin: excludeIds },
            username: { $regex: query, $options: 'i' } // Case-insensitive search by username
        };

        const users = await User.find(matchQuery)
            .skip((page - 1) * limit)
            .limit(limit)
            .select('_id username fullname profilePic bio'); // Fetch only required fields

        // Add followStatus to each user
        const usersWithFollowStatus = users.map(user => ({
            _id: user._id,
            username: user.username,
            fullname: user.fullname,
            profilePic: user.profilePic,
            bio:user.bio,
            followStatus: loggedInUser.following.includes(user._id) ? 'unfollow' : 'follow'
        }));

        res.status(200).json({ users: usersWithFollowStatus });
    } catch (error) {
        console.error('Error fetching user suggestions:', error);
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
}



module.exports = { getRandomUserSuggestions,getSearchSuggestions };