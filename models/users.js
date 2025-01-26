const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+@.+\..+/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: true,
    },
    profilePic: {
      type: String,
      default: '/images/default_profile.jpeg',
    },
    
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    postsCount: {
      type: Number,
      default: 0,
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    relationshipStatus: {
      type: String,
      enum: ['single', 'in-a-relationship', 'married', 'complicated', 'other'],
      default: 'single',
    },
    streak: {
      count: {
        type: Number,
        default: 0,
      },
      lastActive: {
        type: Date,
        default: null,
      },
      lastPostTime: {
        type: Date,
        default: null,
      },
    },
    // New Fields
    dateOfBirth: {
      type: Date,
      default: null,
    },
    collegeName: {
      type: String,
      trim: true,
      default: '',
    },
    bestFriend: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to another user as the best friend
      default: null,
    },
    interests: {
      type: String,
      trim: true,
      default: '',
    },
    favoriteSport: {
      type: String,
      trim: true,
      default: '',
    },
    favoriteGame: {
      type: String,
      trim: true,
      default: '',
    },
    favoriteMusic: {
      type: String,
      trim: true,
      default: '',
    },
    favoriteMovie: {
      type: String,
      trim: true,
      default: '',
    },
    favoriteAnime: {
      type: String,
      trim: true,
      default: '',
    },
    favoriteActor: {
      type: String,
      trim: true,
      default: '',
    },

    mobileNumber:{
      type:String,
      trim:true,
      default:'',
    },

    website:{
      type:String,
      trim:true,
      default:'',
    },

    school:{
      type:String,
      trim:true,
      default:'',
    },

    status: {
      type: String,
      enum: ['student', 'professor', 'working', 'other'],
      default: 'student',
    },

    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say'],
      default: 'prefer-not-to-say',
    },

    residence:{
      type:String,
      trim:true,
      default:'',
    },

    hometown:{
      type:String,
      trim:true,
      default:'',
    },

    highschool:{
      type:String,
      trim:true,
      default:'',
    },

    lookingfor:{
      type:String,
      trim:true,
      default:'',

    },

    interestedIn:{
      type:String,
      trim:true,
      default:'',
    }







  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);