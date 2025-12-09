const express=require('express')
const {authMiddleware}=require('../middlewares/auth')
const Project=require('../models/Project')
const projectRouter=express.Router()
const Task=require('../models/Task')

//Protects all routes in this router
projectRouter.use(authMiddleware)


/**
 * GET/api/projects
 */
projectRouter.get('/',async(req,res)=>{
    try{
        const userProjects=await Project.find({user:req.user._id})
        res.json(userProjects)

    }catch(error){
        console.error(error)
        res.status(500).json({error:error.message})
    }
})

/**
 * GET/api/projects/:projectId
 */
projectRouter.get('/:projectId',async(req,res)=>{
    try{
        const {projectId}=req.params
        const project=await Project.findById(projectId)
        if(!project){
            return res
            .status(404)
            .json({message:`Project with id: ${req.params.projectId} not found!`})
        }
        console.log(req.user)
        if(project.user.toString()!==req.user._id){
            return res.status(403).json({message:"User is not authorized!"})
        }
        res.json(project)

    }catch(error){
        console.error(error)
        res.status(500).json({error:error.message})
    }
})


/**
 * POST/api/projects
 */
projectRouter.post('/',async(req,res)=>{
    try{
        const newProject=await Project.create({
            ...req.body,
            user:req.user._id
        })
    
    res.status(201).json(newProject)
    }catch(error){
        console.error(error)
        res.status(500).json({error:error.message})
    }

})

/**
 * PUT/api/projects/projectId
 */
projectRouter.put('/:projectId',async(req,res)=>{
    try{
        const project=await Project.findById(req.params.projectId)
        if(!project){
            return res.status(404).json({message:"Project not found"})
        } 

        //check the project belongs to the user
        if(req.user._id!==project.user.toString()){
            return res.status(403).json({message:"User is not authorized for this project"})
        }

        const updatedProject=await Project.findByIdAndUpdate(req.params.projectId, req.body,{new:true})
        res.json(updatedProject)
    }catch(error){
        res.status(500).json({error:error.message})
    }
})

/**
 * DELETE/api/projects/projectId
 */
projectRouter.delete('/:projectId',async(req,res)=>{
   try{
    const project=await Project.findById(req.params.projectId)
    if(!project){
        return res.status(404).json({message:"Project not found"})
    }

    //checks if the logged in user is the owner
    if(req.user._id!==project.user.toString()){
        return res.status(403).json({message:"User is not authorized to update this project"}) 
    }

    //delete all tasks belonging to this project
    await Task.deleteMany({project:project._id})

    //delete the project completely
   await Project.findByIdAndDelete(project._id)
     res.json({message:"Project and related tasks deleted successfully"})
   }catch(error){
    res.status(500).json({error:error.message})
   }
})

module.exports=projectRouter