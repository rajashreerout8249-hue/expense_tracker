import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { Icon } from '../components/Icon';
import { colors } from '../theme';

type Kind = 'account' | 'currency' | 'privacy' | 'settings' | 'edit-profile';
const CURRENCIES = [{code:'INR',label:'Indian Rupee (₹)'},{code:'USD',label:'US Dollar ($)'},{code:'EUR',label:'Euro (€)'},{code:'GBP',label:'British Pound (£)'},{code:'AED',label:'UAE Dirham (د.إ)'}];

export default function ProfileDetailScreen({ kind }: { kind: Kind }) {
  const [name,setName] = useState('Expense User');
  const [email,setEmail] = useState('');
  const [phone,setPhone] = useState('');
  const [currency,setCurrency] = useState('INR');
  const [biometric,setBiometric] = useState(false);
  const [hideAmounts,setHideAmounts] = useState(false);
  const [appNotifications,setAppNotifications] = useState(true);
  const [reminders,setReminders] = useState(true);
  const [darkMode,setDarkMode] = useState(true);

  useEffect(() => { (async()=>{
    try {
      const values = await AsyncStorage.multiGet(['profileName','registeredEmail','profilePhone','expenseCurrency','privacyBiometric','privacyHideAmounts','prefNotifications','prefReminders','prefDarkMode']);
      const v = Object.fromEntries(values);
      if(v.profileName) setName(v.profileName);
      if(v.registeredEmail) setEmail(v.registeredEmail);
      if(v.profilePhone) setPhone(v.profilePhone);
      if(v.expenseCurrency) setCurrency(v.expenseCurrency);
      if(v.privacyBiometric) setBiometric(v.privacyBiometric === 'true');
      if(v.privacyHideAmounts) setHideAmounts(v.privacyHideAmounts === 'true');
      if(v.prefNotifications) setAppNotifications(v.prefNotifications === 'true');
      if(v.prefReminders) setReminders(v.prefReminders === 'true');
      if(v.prefDarkMode) setDarkMode(v.prefDarkMode === 'true');
    } catch(e) { console.log('Profile settings load error', e); }
  })(); }, []);

  const save = async (key: string, value: string) => { try { await AsyncStorage.setItem(key,value); } catch(e) { console.log('Setting save error',e); } };
  const saveProfile = async () => {
    if (!name.trim()) { Alert.alert('Name required','Please enter your name.'); return; }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { Alert.alert('Invalid email','Please enter a valid email address.'); return; }
    await AsyncStorage.multiSet([['profileName',name.trim()],['registeredEmail',email.trim()],['profilePhone',phone.trim()]]);
    Alert.alert('Saved','Your profile details have been saved on this device.',[{text:'OK',onPress:()=>router.back()}]);
  };
  const titles: Record<Kind,string> = {account:'Account settings',currency:'Currency',privacy:'Privacy',settings:'App settings','edit-profile':'Edit profile'};
  const subtitle: Record<Kind,string> = {account:'Manage your personal details',currency:'Choose your display currency',privacy:'Control privacy on this device',settings:'Personalize your app','edit-profile':'Update your profile information'};
  const ToggleRow = ({title,description,value,onChange}: {title:string;description:string;value:boolean;onChange:(v:boolean)=>void}) => <View style={styles.option}><View style={styles.optionText}><Text style={styles.optionTitle}>{title}</Text><Text style={styles.description}>{description}</Text></View><Switch value={value} onValueChange={onChange} trackColor={{false:colors.border,true:colors.green}} thumbColor={colors.white}/></View>;

  return <View style={styles.root}>
    <View style={styles.header}><TouchableOpacity onPress={()=>router.back()} style={styles.back}><Icon name="arrow-left" size={22} color={colors.text}/></TouchableOpacity><View style={{flex:1}}><Text style={styles.heading}>{titles[kind]}</Text><Text style={styles.subheading}>{subtitle[kind]}</Text></View></View>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {kind === 'account' || kind === 'edit-profile' ? <View style={styles.card}>
        <Text style={styles.label}>Full name</Text><TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Enter your name" placeholderTextColor={colors.muted} />
        <Text style={styles.label}>Email address</Text><TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="name@example.com" placeholderTextColor={colors.muted} keyboardType="email-address" autoCapitalize="none" />
        <Text style={styles.label}>Phone number</Text><TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Enter phone number" placeholderTextColor={colors.muted} keyboardType="phone-pad" />
        <TouchableOpacity style={styles.primary} onPress={saveProfile}><Text style={styles.primaryText}>Save changes</Text></TouchableOpacity>
        {kind==='account' && <TouchableOpacity style={styles.secondary} onPress={()=>Alert.alert('Password security','Password changes are managed by your sign-in method. This screen does not change your login password.')}><Text style={styles.secondaryText}>Password & sign-in information</Text></TouchableOpacity>}
      </View> : null}
      {kind === 'currency' ? <View style={styles.card}><Text style={styles.sectionTitle}>Select currency</Text><Text style={styles.description}>Saved as your preferred display currency on this device.</Text>{CURRENCIES.map(item=><TouchableOpacity key={item.code} style={styles.currencyRow} onPress={async()=>{setCurrency(item.code);await save('expenseCurrency',item.code);Alert.alert('Currency saved',`${item.label} selected. Existing transaction amounts are not converted automatically.`);}}><View style={[styles.radio,{borderColor:currency===item.code?colors.green:colors.border}]}>{currency===item.code?<View style={styles.radioDot}/>:null}</View><Text style={styles.optionTitle}>{item.label}</Text><Text style={styles.currencyCode}>{item.code}</Text></TouchableOpacity>)}</View> : null}
      {kind === 'privacy' ? <View style={styles.card}><ToggleRow title="Biometric app lock" description="Preference only; device biometric lock is not activated by this toggle yet." value={biometric} onChange={v=>{setBiometric(v);save('privacyBiometric',String(v));}}/><View style={styles.line}/><ToggleRow title="Hide amounts on screen" description="Save your preference for hiding financial amounts." value={hideAmounts} onChange={v=>{setHideAmounts(v);save('privacyHideAmounts',String(v));}}/><View style={styles.note}><Icon name="shield-check-outline" color={colors.green} size={21}/><Text style={styles.description}>Your settings are stored locally on this device. They are not a substitute for account-level security.</Text></View></View> : null}
      {kind === 'settings' ? <View style={styles.card}><ToggleRow title="Dark appearance" description="Current app design uses a dark theme. Theme-wide switching needs to be connected across screens." value={darkMode} onChange={v=>{setDarkMode(v);save('prefDarkMode',String(v));}}/><View style={styles.line}/><ToggleRow title="Notifications" description="Save your notification preference." value={appNotifications} onChange={v=>{setAppNotifications(v);save('prefNotifications',String(v));}}/><View style={styles.line}/><ToggleRow title="Payment reminders" description="Save your bill and payment reminder preference." value={reminders} onChange={v=>{setReminders(v);save('prefReminders',String(v));}}/><TouchableOpacity style={styles.secondary} onPress={()=>router.push('/notifications')}><Text style={styles.secondaryText}>Open notifications page</Text><Icon name="chevron-right" size={20} color={colors.muted}/></TouchableOpacity></View> : null}
    </ScrollView>
  </View>;
}
const styles=StyleSheet.create({root:{flex:1,backgroundColor:colors.background},header:{paddingTop:52,paddingHorizontal:18,paddingBottom:18,flexDirection:'row',alignItems:'center',gap:13,borderBottomWidth:1,borderBottomColor:colors.border},back:{width:42,height:42,borderRadius:13,backgroundColor:colors.surface,alignItems:'center',justifyContent:'center'},heading:{color:colors.text,fontSize:22,fontWeight:'800'},subheading:{color:colors.muted,fontSize:13,marginTop:3},content:{padding:16,paddingBottom:36},card:{backgroundColor:colors.surface,borderRadius:18,padding:18,borderWidth:1,borderColor:colors.border},label:{color:colors.text,fontSize:13,fontWeight:'700',marginTop:10,marginBottom:7},input:{height:48,borderRadius:12,borderWidth:1,borderColor:colors.border,backgroundColor:colors.background,color:colors.text,paddingHorizontal:13},primary:{marginTop:20,height:49,borderRadius:12,backgroundColor:colors.green,alignItems:'center',justifyContent:'center'},primaryText:{color:colors.background,fontWeight:'900',fontSize:15},secondary:{marginTop:14,padding:14,borderRadius:12,backgroundColor:colors.background,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},secondaryText:{color:colors.text,fontWeight:'700',fontSize:13},sectionTitle:{color:colors.text,fontSize:17,fontWeight:'800',marginBottom:6},description:{color:colors.muted,fontSize:12,lineHeight:18,flex:1},currencyRow:{minHeight:55,flexDirection:'row',alignItems:'center',gap:12,borderBottomWidth:1,borderBottomColor:colors.border},radio:{width:20,height:20,borderRadius:10,borderWidth:2,alignItems:'center',justifyContent:'center'},radioDot:{width:10,height:10,borderRadius:5,backgroundColor:colors.green},currencyCode:{color:colors.muted,fontWeight:'800'},option:{flexDirection:'row',alignItems:'center',gap:12,paddingVertical:12},optionText:{flex:1},optionTitle:{color:colors.text,fontSize:14,fontWeight:'700'},line:{height:1,backgroundColor:colors.border},note:{flexDirection:'row',alignItems:'center',gap:10,marginTop:18,padding:12,borderRadius:12,backgroundColor:colors.background}});
