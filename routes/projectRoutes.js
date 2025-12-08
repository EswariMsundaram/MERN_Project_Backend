const express=require('express')
const {authMiddleware}=require('../middlewares/auth')
const Project=require('../models/Project')
const projectRouter=express.Router()

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
        const updateProject=await Project.findById(req.params.projectId,req.body,{new:true})
        res.json(project)
    }catch(error){
        res.status(500).json({error:error.message})
    }
})

/**
 * DELETE/api/projects/projectId
 */
projectRouter.delete('/:projectId',async(req,res)=>{
   try{
    const updateProject=await Project.findById(req.params.projectId)

    if(req.user._id!==updateProject.user.toString()){
        return res.status(403).json({message:"User is not authorized to update this project"})
        res.json({message:"Project deleted"})
    }
    const project=await Project.findByIdAndDelete(req.params.projectId)
   }catch(error){
    res.status(500).json({error:error.message})
   }
})

module.exports=projectRouter