const mongoose = require('mongoose');

const userStorySchema = new mongoose.Schema({
  project: {
    type: String, // Assuming 'project' is a String
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  priority: {
    type: Number,
    required: true,
    default: 0,
  },
  // You can add more fields as needed for your user stories
});

const UserStory = mongoose.model('UserStory', userStorySchema);

module.exports = UserStory;
