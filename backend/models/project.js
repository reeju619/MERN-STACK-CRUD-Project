const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
    name: String,              
    description: String,        
    project_owner_id: mongoose.Schema.Types.ObjectId,
    manager_id: mongoose.Schema.Types.ObjectId,
    team_id: mongoose.Schema.Types.ObjectId
});

const Project = mongoose.model("Project", ProjectSchema);

module.exports = Project;
