const router=require("express").Router();
const Transaction=require("../models/Transaction");
router.get("/",async(req,res)=>{try{const q=req.query.date?{date:req.query.date}:{};res.json(await Transaction.find(q).sort({date:-1,createdAt:-1}));}catch(e){res.status(500).json({message:e.message});}});
router.post("/",async(req,res)=>{try{res.status(201).json(await Transaction.create(req.body));}catch(e){res.status(400).json({message:e.message});}});
router.put("/:id",async(req,res)=>{try{const x=await Transaction.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});if(!x)return res.status(404).json({message:"Transaction not found"});res.json(x);}catch(e){res.status(400).json({message:e.message});}});
router.delete("/:id",async(req,res)=>{try{const x=await Transaction.findByIdAndDelete(req.params.id);if(!x)return res.status(404).json({message:"Transaction not found"});res.json({message:"Transaction deleted"});}catch(e){res.status(400).json({message:e.message});}});
router.get("/summary/today",async(req,res)=>{try{const d=new Date().toISOString().slice(0,10);const rows=await Transaction.find({date:d});let income=0,expense=0;rows.forEach(x=>x.type==="income"?income+=x.amount:expense+=x.amount);res.json({date:d,income,expense,balance:income-expense,transactions:rows});}catch(e){res.status(500).json({message:e.message});}});
module.exports=router;
