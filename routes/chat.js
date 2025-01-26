// const express=require('express');
// const router=express.Router;
// const User=require('../models/users');
// const Message=require('../models/message');

// router.get('users/search', async (req, res) => {
//     const query = req.query.q;
//     try {
//       const users = await User.find({ username: { $regex: query, $options: 'i' } })
//         .select('username profilePic')
//         .limit(10);
//       res.json(users);
//     } catch (error) {
//       res.status(500).json({ error: 'Server Error' });
//     }
//   });

//   router.post('/create/group', async (req, res) => {
//     const { name, members, admin } = req.body;
  
//     try {
//       const newGroup = new Group({ name, members, admin });
//       await newGroup.save();
//       res.json(newGroup);
//     } catch (error) {
//       res.status(500).json({ error: 'Server Error' });
//     }
//   });

// router.get('/fetch/messages', async (req, res) => {
//     const { userId, friendId, groupId } = req.query;
  
//     try {
//       let messages = [];
//       if (groupId) {
//         messages = await Message.find({ groupId }).sort('timestamp');
//       } else {
//         messages = await Message.find({
//           $or: [
//             { sender: userId, receiver: friendId },
//             { sender: friendId, receiver: userId },
//           ],
//         }).sort('timestamp');
//       }
//       res.json(messages);
//     } catch (error) {
//       res.status(500).json({ error: 'Server Error' });
//     }
//   });
  

// router.post('/send/messages', async (req, res) => {
//     const { sender, receiver, groupId, message } = req.body;
  
//     try {
//       const newMessage = new Message({ sender, receiver, groupId, message });
//       await newMessage.save();
//       res.json(newMessage);
//     } catch (error) {
//       res.status(500).json({ error: 'Server Error' });
//     }
//   });
  
// module.exports=router;