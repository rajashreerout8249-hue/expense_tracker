import React, { useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, Pressable,
  SafeAreaView, StyleSheet, Text, TextInput, View, Alert
} from 'react-native';
import { router } from 'expo-router';
import { loginWithEmail } from '../src/api/authApi';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.'); return;
    }
    if (!password) { setError('Please enter your password.'); return; }
    setError(''); setLoading(true);
    try {
      await loginWithEmail(email.trim().toLowerCase(), password);
      router.replace('/');
    } catch (e: any) {
      setError(e?.message || 'Unable to login. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.card}>
          <View style={styles.logoCircle}><Text style={styles.logo}>₹</Text></View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Login with your email and password</Text>
          <Text style={styles.label}>Email Address</Text>
          <TextInput value={email} onChangeText={v => {setEmail(v); setError('');}}
            keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
            placeholder="Enter your email" placeholderTextColor="#9CA3AF" style={styles.input}/>
          <Text style={[styles.label, {marginTop:16}]}>Password</Text>
          <TextInput value={password} onChangeText={v => {setPassword(v); setError('');}}
            secureTextEntry autoCapitalize="none" placeholder="Enter password"
            placeholderTextColor="#9CA3AF" style={styles.input}/>
          {!!error && <Text style={styles.error}>{error}</Text>}
          <Pressable style={[styles.button, loading && styles.disabled]} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff"/> : <Text style={styles.buttonText}>Login</Text>}
          </Pressable>
          <Pressable onPress={() => router.push('/register')} style={styles.linkWrap}>
            <Text style={styles.link}>New here? Create account</Text>
          </Pressable>
          <Text style={styles.info}>Use the same email and password whenever you return.</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:'#F5F7F5'}, container:{flex:1,justifyContent:'center',padding:20},
  card:{backgroundColor:'#FFFFFF',borderRadius:24,padding:24,shadowColor:'#000',shadowOpacity:0.08,shadowRadius:16,elevation:4},
  logoCircle:{width:70,height:70,borderRadius:35,backgroundColor:'#245642',alignItems:'center',justifyContent:'center',alignSelf:'center',marginBottom:18},
  logo:{color:'#fff',fontSize:34,fontWeight:'800'}, title:{fontSize:28,fontWeight:'800',color:'#17231D',textAlign:'center'},
  subtitle:{fontSize:15,color:'#6B7280',textAlign:'center',marginTop:7,marginBottom:28},
  label:{fontSize:14,fontWeight:'700',color:'#374151',marginBottom:8},
  input:{height:52,borderWidth:1,borderColor:'#D1D5DB',borderRadius:12,paddingHorizontal:14,fontSize:16,color:'#111827'},
  error:{color:'#DC2626',marginTop:10,fontSize:13}, button:{height:54,borderRadius:12,backgroundColor:'#245642',alignItems:'center',justifyContent:'center',marginTop:22},
  disabled:{opacity:0.65},buttonText:{color:'#fff',fontSize:16,fontWeight:'800'},info:{color:'#6B7280',fontSize:12,textAlign:'center',marginTop:16},
  linkWrap:{alignItems:'center',paddingTop:18},link:{color:'#245642',fontSize:14,fontWeight:'800'}
});
