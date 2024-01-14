// TeamMember.js

const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  team_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team', // Reference to the Team model
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },

  userName: String, // Add a field for user name
  teamName: String, // Add a field for team name

});

const TeamMember = mongoose.model('TeamMember', teamMemberSchema);

module.exports = TeamMember;
