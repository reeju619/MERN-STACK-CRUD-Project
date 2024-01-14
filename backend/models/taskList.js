// taskList.js
const mongoose = require('mongoose');

const tasklistSchema = new mongoose.Schema({
  projectName: {
    type: String, // Store the project name
    required: true,
  },
  taskDescription: {
    type: String, // Store the task description
    required: true,
  },
  taskStatus: {
    type: String, // Store the task status
    enum: ['New', 'In Progress', 'Awaiting Confirmation', 'Completed'], // Define valid task statuses
    required: true,
    default: 'New', // Set 'New' as the default status
  },
});

const Tasklist = mongoose.model('Tasklist', tasklistSchema);

module.exports = Tasklist;
