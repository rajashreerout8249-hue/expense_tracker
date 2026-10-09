import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { registerWithEmail } from '../src/api/authApi';

export default function RegisterScreen() {
  const [name,setName]=useState(''); const [email,setEmail]=useState('');
  const [password,setPassword]=useState(''); const [confirm,setConfirm]=useState('');
  const [loading,setLoading]=useState(false); const [error,setError]=useState('');
  const submit=async()=>{
    if(!name.trim()){setError('Please enter your name.');return;}
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())){setError('Please enter a valid email.');return;}
    if(password.length<8){setError('Password must be at least 8 characters.');return;}
    if(password!==confirm){setError('Passwords do not match.');return;}
    setError('');setLoading(true);
    try{await registerWithEmail(name.trim(),email.trim().toLowerCase(),password);router.replace('/');}
    catch(e:any){setError(e?.message||'Unable to create account.');}
    finally{setLoading(false);}
  };
  return <SafeAreaView style={s.safe}><KeyboardAvoidingView style={s.container} behavior={Platform.OS==='ios'?'padding':undefined}>
    <Pressable onPress={()=>router.back()}><Text style={s.back}>‹ Back to login</Text></Pressable>
    <View style={s.card}><View style={s.logoCircle}><Text style={s.logo}>₹</Text></View>
    <Text style={s.title}>Create Account</Text><Text style={s.subtitle}>Create your personal expense tracker account</Text>
    <Text style={s.label}>Full name</Text><TextInput value={name} onChangeText={setName} placeholder="Enter your name" placeholderTextColor="#9CA3AF" style={s.input}/>
    <Text style={s.label}>Email address</Text><TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoCorrect={false} placeholder="Enter your email" placeholderTextColor="#9CA3AF" style={s.input}/>
    <Text style={s.label}>Password (minimum 8 characters)</Text><TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="Create password" placeholderTextColor="#9CA3AF" style={s.input}/>
    <Text style={s.label}>Confirm password</Text><TextInput value={confirm} onChangeText={setConfirm} secureTextEntry placeholder="Re-enter password" placeholderTextColor="#9CA3AF" style={s.input}/>
    {!!error&&<Text style={s.error}>{error}</Text>}
    <Pressable style={[s.button,loading&&s.disabled]} onPress={submit} disabled={loading}>{loading?<ActivityIndicator color="#fff"/>:<Text style={s.buttonText}>Create Account</Text>}</Pressable>
    </View></KeyboardAvoidingView></SafeAreaView>;
}
const s=StyleSheet.create({safe:{flex:1,backgroundColor:'#F5F7F5'},container:{flex:1,justifyContent:'center',padding:20},back:{color:'#245642',fontSize:16,fontWeight:'700',marginBottom:16},card:{backgroundColor:'#fff',borderRadius:24,padding:22,elevation:4},logoCircle:{width:58,height:58,borderRadius:29,backgroundColor:'#245642',alignItems:'center',justifyContent:'center',alignSelf:'center',marginBottom:12},logo:{color:'#fff',fontSize:30,fontWeight:'800'},title:{fontSize:26,fontWeight:'800',color:'#17231D',textAlign:'center'},subtitle:{fontSize:13,color:'#6B7280',textAlign:'center',marginTop:6,marginBottom:18},label:{fontSize:13,fontWeight:'700',color:'#374151',marginBottom:6,marginTop:10},input:{height:46,borderWidth:1,borderColor:'#D1D5DB',borderRadius:10,paddingHorizontal:12,fontSize:15,color:'#111827'},error:{color:'#DC2626',marginTop:10,fontSize:13},button:{height:52,borderRadius:12,backgroundColor:'#245642',alignItems:'center',justifyContent:'center',marginTop:20},disabled:{opacity:.65},buttonText:{color:'#fff',fontSize:16,fontWeight:'800'}});
