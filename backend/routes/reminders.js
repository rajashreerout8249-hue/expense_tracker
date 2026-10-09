const router = require("express").Router();
const Reminder = require("../models/Reminder");

router.get("/", async (req,res)=>{ try { res.json(await Reminder.find().sort({createdAt:-1})); } catch(e){res.status(500).json({message:e.message});} });
router.post("/", async (req,res)=>{ try { const item=await Reminder.create(req.body); res.status(201).json(item); } catch(e){res.status(400).json({message:e.message});} });
router.put("/:id", async (req,res)=>{ try { const item=await Reminder.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true}); if(!item)return res.status(404).json({message:"Reminder not found"}); res.json(item); } catch(e){res.status(400).json({message:e.message});} });
router.delete("/:id", async (req,res)=>{ try { const item=await Reminder.findByIdAndDelete(req.params.id); if(!item)return res.status(404).json({message:"Reminder not found"}); res.json({message:"Reminder deleted"}); } catch(e){res.status(400).json({message:e.message});} });
module.exports=router;
