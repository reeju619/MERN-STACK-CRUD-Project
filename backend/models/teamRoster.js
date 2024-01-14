const mongoose = require('mongoose');

// Define the TeamRoster schema
const teamRosterSchema = new mongoose.Schema({
  team_id: {
    type: Number, // Change the data type as needed (e.g., String or ObjectId)
    required: true,
  },
  member_id: {
    type: Number, // Change the data type as needed (e.g., String or ObjectId)
    required: true,
  },
});

// Create the TeamRoster model
const TeamRoster = mongoose.model('TeamRoster', teamRosterSchema);

module.exports = TeamRoster;
