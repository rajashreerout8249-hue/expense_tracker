const router=require("express").Router();
const Profile=require("../models/Profile");
router.get("/",async(req,res)=>{try{let x=await Profile.findOne();if(!x)x=await Profile.create({});res.json(x);}catch(e){res.status(500).json({message:e.message});}});
router.put("/",async(req,res)=>{try{let x=await Profile.findOne();if(x)x=await Profile.findByIdAndUpdate(x._id,req.body,{new:true,runValidators:true});else x=await Profile.create(req.body);res.json(x);}catch(e){res.status(400).json({message:e.message});}});
module.exports=router;
