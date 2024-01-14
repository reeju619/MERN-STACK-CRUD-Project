// assigned.js
const mongoose = require('mongoose');

const assignedSchema = new mongoose.Schema({
  userStoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserStory', // Reference to the UserStory model
    required: true,
  },

  project: {
    type: String, // Store the project name
    required: true,
  },
  description: {
    type: String, // Store the project description
    required: true,
  },
});

const Assigned = mongoose.model('Assigned', assignedSchema);

module.exports = Assigned;
