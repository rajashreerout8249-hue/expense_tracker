const router=require("express").Router();
const Task=require("../models/Task");
router.get("/",async(req,res)=>{try{res.json(await Task.find().sort({completed:1,dueDate:1,createdAt:-1}));}catch(e){res.status(500).json({message:e.message});}});
router.post("/",async(req,res)=>{try{res.status(201).json(await Task.create(req.body));}catch(e){res.status(400).json({message:e.message});}});
router.put("/:id",async(req,res)=>{try{const x=await Task.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});if(!x)return res.status(404).json({message:"Task not found"});res.json(x);}catch(e){res.status(400).json({message:e.message});}});
router.delete("/:id",async(req,res)=>{try{const x=await Task.findByIdAndDelete(req.params.id);if(!x)return res.status(404).json({message:"Task not found"});res.json({message:"Task deleted"});}catch(e){res.status(400).json({message:e.message});}});
module.exports=router;
