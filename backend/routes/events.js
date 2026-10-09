const router=require("express").Router();
const Event=require("../models/Event");
router.get("/",async(req,res)=>{try{res.json(await Event.find().sort({date:1,time:1}));}catch(e){res.status(500).json({message:e.message});}});
router.post("/",async(req,res)=>{try{res.status(201).json(await Event.create(req.body));}catch(e){res.status(400).json({message:e.message});}});
router.put("/:id",async(req,res)=>{try{const x=await Event.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});if(!x)return res.status(404).json({message:"Event not found"});res.json(x);}catch(e){res.status(400).json({message:e.message});}});
router.delete("/:id",async(req,res)=>{try{const x=await Event.findByIdAndDelete(req.params.id);if(!x)return res.status(404).json({message:"Event not found"});res.json({message:"Event deleted"});}catch(e){res.status(400).json({message:e.message});}});
module.exports=router;
