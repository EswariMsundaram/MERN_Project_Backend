const express=require('express')
const {authMiddleware}=require('../middlewares/auth')
const Project=require('../models/Project')
const Task=require('../models/Task')
const TaskRouter=express.Router()

//Protects all routes in this router
TaskRouter.use(authMiddleware)

/**
* GET/api/tasks/:taskId
*/
TaskRouter.get('/tasks/:taskId',async(req,res)=>{
    try{
        const task=await Task.findById(req.params.taskId)
        if(!task){
            return res.status(404).json({message:"Task not found"})
        }
        //to find the parent project
        const project= await Project.findById(task.project)
        if(!project){
            return res.status(404).json({message:"Parent not found"})
        }

        if(project.user.toString()!==req.user._id.toString()){
            return res.status(403).json({message:"Not authorized"})
        }
        res.json(task)
    }catch(error){
        res.status(500).json({error:error.message})
    }
})


/**
 * GET/api/projects/:projectId/tasks
 */
TaskRouter.get('/:projectId/tasks',async(req,res)=>{
    try{
        const {projectId}=req.params
        const project=await Project.findById(projectId)
        if(!project){
            return res
            .status(404)
            .json({message:`Project with id: ${req.params.projectId} not found!`})
        }
        //console.log(req.user)
        if(project.user.toString()!==req.user._id.toString()){
            return res.status(403).json({message:"User is not authorized!"})
        }
        const tasks=await Task.find({project:projectId})
        res.json(tasks)

    }catch(error){
        console.error(error)
        res.status(500).json({error:error.message})
    }
})


/**
 * POST/api/projects/:projectId/tasks
 */
TaskRouter.post('/:projectId/tasks',async(req,res)=>{
    try{
        const {projectId}=req.params;//getting the projectId 

        //Checks whether the project exists
        const project=await Project.findById(projectId)
        if(!project) return res.status(404).json({message:"Project not found"})

        //Checks if the project belongs to user
        if(project.user.toString()!==req.user._id.toString()){
            return res.status(403).json({message:"Not authorized"})
        }
        
        const task=await Task.create({
            ...req.body,
            project:projectId
        })
    
    res.status(201).json(task)
    }catch(error){
        console.error(error)
        res.status(500).json({error:error.message})
    }

})

//Function for PUT and DELETE
async function verifyTaskOwnership(taskId, userId){
    const task=await Task.findById(taskId)
    if(!task)return {error:"Task not found"}

    //find parent project
    const project=await Project.findById(task.project)
    if(!project) return {error:"Parent project not found"}

    if(project.user.toString()!==userId.toString()){
        return{error:"Not authorized"}
    }
    return{task,project}
}

/**
 * PUT /tasks/:taskId
 */
TaskRouter.put('/tasks/:taskId',async(req,res)=>{
    try{
        const {taskId}=req.params
        const {error}=await verifyTaskOwnership(taskId, req.user._id)
        if(error) return res.status(error==="Not authorized" ? 403 : 404).json({message:error})

        const updateTask=await Task.findByIdAndUpdate(taskId,req.body,{new:true})
        res.json(updateTask)
    }catch(error){
        res.status(500).json({error:error.message})
    }
})

/**
 * DELETE/tasks/:taskId
 */
TaskRouter.delete('/tasks/:taskId',async(req,res)=>{
   try{
        const {taskId}=req.params
        const {error}=await verifyTaskOwnership(taskId, req.user._id)
        if(error) return res.status(error==="Not authorized" ? 403 : 404).json({message:error})

        await Task.findByIdAndDelete(taskId)
        res.json({message:"Task deleted successfully"})
    
   }catch(error){
    res.status(500).json({error:error.message})
   }
})

module.exports=TaskRouter