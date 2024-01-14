// Import the Project model at the top of your index.js
const User = require('./models/user');
const Project = require('./models/project');
const Team = require('./models/teamName');
const TeamRoster = require('./models/teamRoster');
const UserStory = require('./models/userStory');
const Task = require('./models/taskList');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { request, response } = require('express');
const TeamMember = require('./models/teamMember');
const Assigned = require('./models/assigned');
const Tasklist = require('./models/taskList');

dotenv.config();

const app = express();
const port = process.env.PORT || 9000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  
});

const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


// Add this route to fetch tasks from the Tasklist table
app.get('/getTasks', async (req, res) => {
  try {
    const tasks = await Tasklist.find({}, 'projectName taskStatus');
    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add this route to update task status
app.put('/updateTaskStatus', async (req, res) => {
  try {
    const { taskId, newStatus } = req.body;

    // Validate the request data here if needed

    await Tasklist.findByIdAndUpdate(taskId, { taskStatus: newStatus });

    res.status(200).json({ message: 'Task status updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/getUnassignedUserStories', async (req, res) => {
  try {
    // Fetch project names assigned to user stories from the UserStory model
    const assignedProjects = await UserStory.distinct('project');

    // Fetch all project names from the Project model
    const allProjects = await Project.find({}, 'name description');

    // Filter unassigned projects
    const unassignedProjects = allProjects.filter((project) => !assignedProjects.includes(project.name));

    res.status(200).json(unassignedProjects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/getUnassignedProjects', async (req, res) => {
  try {
    // Fetch project IDs assigned to user stories from the UserStory model
    const assignedProjectIds = await UserStory.distinct('project');

    // Fetch all project data from the Project model
    const allProjects = await Project.find({}, 'name description');

    // Filter unassigned projects based on their IDs
    const unassignedProjects = allProjects.filter((project) => !assignedProjectIds.includes(project._id.toString()));

    res.status(200).json(unassignedProjects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/assignUserStory', async (req, res) => {
  try {
    const { userStoryId, project } = req.body;

    if (!project || !project.name || !project.description) {
      // Handle the case where 'project' is missing or invalid
      return res.status(400).json({ error: 'Invalid project data' });
    }

    // For testing, you can set the project name and description
    const assignedProject = {
      name: project.name,
      description: project.description,
    };

    // Create a new assignment entry
    const assignment = new Assigned({
      userStoryId: userStoryId,
      // assignedTo: teamMemberId, // Assuming you have the logged-in team member ID
      project: assignedProject.name, // Store project name
      description: assignedProject.description, // Store project description
    });

    // Save the assignment to the database
    await assignment.save();

    // You can also remove the assigned user story from the 'UserStory' collection if needed
    // await UserStory.findByIdAndRemove(userStoryId);

    res.status(200).json({ message: 'User story assigned successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




// Add a new route for creating a user story
app.post('/createUserStory', async (req, res) => {
  try {
    const { project, description, priority } = req.body;

    if (!project || !description || !priority) {
      return res.status(400).json({
        message: 'Please enter all the required fields',
      });
    }

    // Assuming you have a UserStory model, create a new user story instance
    const userStory = {
      project: project,
      description: description,
      priority: priority,
    };

    // // Save the new user story to the database
    // await newUserStory.save();

    const newUserStory = await UserStory.create(userStory);

    return res.status(201).json(newUserStory);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Error creating user story',
    });
  }
});



// Add a new route for adding team members
app.post('/createTeamMember', async (req, res) => {
  try {
    const { team_id, user_id } = req.body;

    if (!team_id || !user_id) {
      return res.status(400).send({
        message: "Please select both a team and a user.",
      });
    }

    // Retrieve the names of the user and team based on their IDs
    const user = await User.findById(user_id);
    const team = await Team.findById(team_id);

    if (!user || !team) {
      return res.status(400).send({
        message: "Invalid user or team ID.",
      });
    }

    // Create a team member object with names and IDs
    const teamMember = {
      team_id: team_id,
      user_id: user_id,
      userName: `${user.firstName} ${user.lastName}`, // Store user name
      teamName: team.team_name, // Store team name
    };

    // Save the team member to the database
    const savedTeamMember = await TeamMember.create(teamMember);

    return res.status(201).json(savedTeamMember);
  } catch (error) {
    return res.status(500).send({
      message: "Error creating team member",
    });
  }
});

// Add this route to your Express app
app.get('/getTeamMembers/:teamId', async (req, res) => {
  const { teamId } = req.params;

  try {
    // Use Mongoose to find members in the TeamMembers collection
    const teamMembers = await TeamMember.find({ team_id: teamId });

    // Return the list of team members
    res.status(200).json(teamMembers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Add this route to your Express app
app.post('/removeTeamMember', async (req, res) => {
  const { teamId, userIds } = req.body;

  try {
    // Remove team members with matching team ID and user IDs
    await TeamMember.deleteMany({ team_id: teamId, user_id: { $in: userIds } });

    // Return a success response
    res.status(200).json({ message: 'Team members removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


  
// Add a new route for creating a project
app.post('/createProject', async (request, response) => {
  try {
    const { proj_name, proj_desc, prod_owner_id, mgr_id, team_id } = request.body;

    if (!proj_name || !proj_desc || !prod_owner_id || !mgr_id || !team_id) {
      return response.status(400).send({
        message: "Please enter all the required fields",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(prod_owner_id) ||
        !mongoose.Types.ObjectId.isValid(mgr_id) ||
        !mongoose.Types.ObjectId.isValid(team_id)) {
      return response.status(400).send({
        message: "Invalid ObjectID format for product owner, manager, or team",
      });
    }

    const newProject = {
      name: proj_name,
      description: proj_desc,
      project_owner_id: prod_owner_id,
      manager_id: mgr_id,
      team_id: team_id,
    };

    const project = await Project.create(newProject);

    return response.status(201).send(project);
  } catch (error) {
    return response.status(500).send({
      message: "Error creating project",
    });
  }
});

app.post('/createTeam', async (request, response) => {
  try {
    if(
      !request.body.team_name 
    ) {
      return response.status(400).send({
        message: "team name can not be empty",
    });
  }
  const newTeam = {
    team_name : request.body.team_name,
  };
  const team = await Team.create(newTeam);
    
  return response.status(201).send(team);
} catch (error) {
  return response.status(500).send({
    message: "Error creating team",});
  }
});

// Add a new route for creating a team roster
app.post('/createTeamRoster', async (req, res) => {
  try {
    console.log('Received signup request:', req.body); // Log the received data
    const newTeamRoster = new TeamRoster(req.body);
    await newTeamRoster.save();
    console.log('TeamRoster saved:', newTeamRoster); // Log the saved user
    res.status(201).json(newTeamRoster);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a new route for creating a user story
app.post('/createUserStory', async (req, res) => {
  try {
    console.log('Received signup request:', req.body); // Log the received data
    const newUserStory = new UserStory(req.body);
    await newUserStory.save();
    console.log('UserStory saved:', newUserStory); // Log the saved user
    res.status(201).json(newUserStory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// Add this route to create and save tasks in the Tasklist table
app.post('/createTask', async (req, res) => {
  try {
    const { projectName, taskDescription, taskStatus } = req.body;

    // Validate the request data here if needed

    const newTask = new Tasklist({
      projectName,
      taskDescription,
      taskStatus,
    });

    await newTask.save();

    res.status(200).json({ message: 'Task created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.post('/createUser', async (req, res) => {
  try {
    console.log('Received signup request:', req.body); // Log the received data
    const newUser = new User(req.body);
    await newUser.save();
    console.log('User saved:', newUser); // Log the saved user
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/getUser', async (req, res) => {
  const { username, password } = req.query;
  try {
    const user = await User.findOne({ username, password });
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Add a new route for getting users
app.get('/getUsers', async (req, res) => {
  try {
    // Retrieve a list of users from the database
    const users = await User.find({}, 'firstName lastName'); // Adjust the field name as per your schema

    // Send the list of users as a JSON response
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a new route for getting teams
app.get('/getTeams', async (req, res) => {
  try {
    // Retrieve a list of teams from the database
    const teams = await Team.find({}, 'team_name'); // Adjust the field name as per your schema

    // Send the list of teams as a JSON response
    res.status(200).json(teams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add this route to fetch project names from the Assigned table
app.get('/getAssignedProjects', async (req, res) => {
  try {
    const assignedProjects = await Assigned.find({}, 'project');
    const projectNames = assignedProjects.map((project) => ({ _id: project._id, name: project.project }));
    res.status(200).json(projectNames);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/getUserStories', async (req, res) => {
  const { projectName } = req.query;
  try {
    const userStories = await UserStory.find({ project: projectName });
    res.status(200).json(userStories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/deleteUserStory/:userStoryId', async (req, res) => {
  const { userStoryId } = req.params;
  try {
    const deletedStory = await UserStory.findByIdAndDelete(userStoryId);
    if (deletedStory) {
      res.status(200).json({ message: 'User story deleted successfully' });
    } else {
      res.status(404).json({ message: 'User story not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/getProjectNames', async (req, res) => {
  try {
    // Retrieve a list of project names from the Project collection
    const projects = await Project.find({}, 'name'); // Assuming your project schema has a 'name' field

    // Extract project names from the projects and send as a JSON response
    const projectNames = projects.map((project) => project.name);
    res.status(200).json(projectNames);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Add a new route for getting project details with manager name, owner name, and team name
app.get('/getProjects', async (req, res) => {
  try {
    const projects = await Project.find().exec();
    const populatedProjects = await Promise.all(
      projects.map(async (project) => {
        const manager = await User.findById(project.manager_id).exec();
        const owner = await User.findById(project.project_owner_id).exec();
        const team = await Team.findById(project.team_id).exec();

        return {
          project_name: project.name,
          project_description: project.description,
          manager_name: manager ? `${manager.firstName} ${manager.lastName}` : 'N/A',
          owner_name: owner ? `${owner.firstName} ${owner.lastName}` : 'N/A',
          team_name: team ? team.team_name : 'N/A',
        };
      })
    );

    res.status(200).json(populatedProjects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
