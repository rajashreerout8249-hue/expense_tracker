const router=require("express").Router();
const Budget=require("../models/Budget");
router.get("/",async(req,res)=>{try{const q=req.query.month?{month:req.query.month}:{};res.json(await Budget.find(q).sort({createdAt:-1}));}catch(e){res.status(500).json({message:e.message});}});
router.post("/",async(req,res)=>{try{res.status(201).json(await Budget.create(req.body));}catch(e){res.status(400).json({message:e.message});}});
router.put("/:id",async(req,res)=>{try{const x=await Budget.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});if(!x)return res.status(404).json({message:"Budget not found"});res.json(x);}catch(e){res.status(400).json({message:e.message});}});
router.delete("/:id",async(req,res)=>{try{const x=await Budget.findByIdAndDelete(req.params.id);if(!x)return res.status(404).json({message:"Budget not found"});res.json({message:"Budget deleted"});}catch(e){res.status(400).json({message:e.message});}});
module.exports=router;
