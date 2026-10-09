import React, { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput
} from 'react-native';

import AppHeader from '../components/AppHeader';
import BottomNav from '../components/BottomNav';
import { Icon } from '../components/Icon';

import { useExpense } from '../context/ExpenseContext';
import { colors } from '../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const { resetData } = useExpense();
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('Expense User');
  const [currency, setCurrency] = useState('INR');

  useFocusEffect(useCallback(() => {
    AsyncStorage.getItem('registeredEmail').then(value => { if (value) setEmail(value); });
    AsyncStorage.getItem('profileName').then(value => { if (value) setDisplayName(value); });
    AsyncStorage.getItem('expenseCurrency').then(value => { if (value) setCurrency(value); });
    return undefined;
  }, []));

  const saveEmail = async () => {
    const value = email.trim();
    if (!value || !value.includes('@')) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }
    await AsyncStorage.setItem('registeredEmail', value);
    Alert.alert('Saved', 'Your registered email has been saved for reminder emails.');
  };

  const handleReset = () => {
    Alert.alert(
      'Reset sample data',
      'Restore the original design sample transactions?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: resetData
        }
      ]
    );
  };

  return (
    <View style={styles.root}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* HEADER */}

        <AppHeader
          title="Profile"
          subtitle="Personal settings"
        />

        {/* PROFILE */}

        <View style={styles.profile}>

          <View style={styles.avatar}>
            <Text style={styles.initials}>
              RR
            </Text>
          </View>

          <Text style={styles.name}>
            {displayName}
          </Text>

          <Text style={styles.email}>
            Personal expense tracker
          </Text>

          <TextInput
            style={styles.emailInput}
            value={email}
            onChangeText={setEmail}
            placeholder="Registered email address"
            placeholderTextColor={colors.muted}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.emailSave} onPress={saveEmail}>
            <Text style={styles.emailSaveText}>Save email for reminders</Text>
          </TouchableOpacity>

        </View>

        {/* SETTINGS */}

        <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/edit-profile')} style={styles.editProfileLink}>
          <Text style={styles.editProfileText}>Edit profile details</Text>
          <Icon name="chevron-right" size={18} color={colors.green} />
        </TouchableOpacity>

        <Row icon="account-outline" title="Account settings" onPress={() => router.push('/account-settings')} />

        <Row
          icon="bell-outline"
          title="Notifications"
          onPress={() => router.push('/notifications')}
        />

        <Row
          icon="currency-inr"
          title="Currency"
          right={currency}
          onPress={() => router.push('/currency')}
        />

        <Row
          icon="shield-check-outline"
          title="Privacy"
          onPress={() => router.push('/privacy')}
        />

        <Row icon="cog-outline" title="App settings" onPress={() => router.push('/app-settings')} />

        {/* RESET */}

        <TouchableOpacity
          style={styles.reset}
          activeOpacity={0.8}
          onPress={handleReset}
        >

          <Icon
            name="refresh"
            size={20}
            color={colors.danger}
          />

          <Text style={styles.resetText}>
            Reset sample data
          </Text>

        </TouchableOpacity>

        <View style={{ height: 100 }} />

      </ScrollView>

      {/* BOTTOM NAV */}

      <BottomNav />

    </View>
  );
}

function Row({
  icon,
  title,
  right,
  onPress
}: {
  icon: React.ComponentProps<
    typeof Icon
  >['name'];

  title: string;

  right?: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.8}
      onPress={onPress}
    >

      <View style={styles.rowIcon}>

        <Icon
          name={icon}
          size={20}
          color={colors.green}
        />

      </View>

      <Text style={styles.rowTitle}>
        {title}
      </Text>

      {right ? (

        <Text style={styles.right}>
          {right}
        </Text>

      ) : (

        <Icon
          name="chevron-right"
          size={20}
          color={colors.muted}
        />

      )}

    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({

  root: {
    flex: 1,
    backgroundColor: colors.background
  },

  content: {
    paddingBottom: 105
  },

  profile: {
    backgroundColor: colors.surface,

    padding: 26,

    borderRadius: 18,

    alignItems: 'center',

    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 14
  },

  avatar: {
    width: 82,
    height: 82,

    borderRadius: 41,

    backgroundColor: 'rgba(16,185,129,0.12)',

    borderWidth: 1,
    borderColor: colors.green,

    alignItems: 'center',
    justifyContent: 'center'
  },

  initials: {
    color: colors.green,

    fontSize: 24,
    fontWeight: '900'
  },

  name: {
    color: colors.text,

    fontSize: 20,
    fontWeight: '800',

    marginTop: 12
  },

  email: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 3
  },

  emailInput: {
    width: '100%',
    height: 46,
    marginTop: 14,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    color: colors.text,
    paddingHorizontal: 12
  },

  emailSave: {
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: colors.green
  },

  emailSaveText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '800'
  },

  row: {
    height: 62,

    backgroundColor: colors.surface,

    marginHorizontal: 16,
    marginBottom: 8,

    borderRadius: 14,

    paddingHorizontal: 14,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 12
  },

  rowIcon: {
    width: 40,
    height: 40,

    borderRadius: 12,

    backgroundColor: 'rgba(16,185,129,0.12)',

    alignItems: 'center',
    justifyContent: 'center'
  },

  rowTitle: {
    flex: 1,

    color: colors.text,

    fontSize: 15,
    fontWeight: '700'
  },

  right: {
    color: colors.muted,

    fontWeight: '700'
  },

  editProfileLink: {
    marginHorizontal: 20, marginTop: -5, marginBottom: 12, paddingVertical: 8,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5
  },
  editProfileText: { color: colors.green, fontSize: 13, fontWeight: '800' },

  reset: {
    height: 54,

    backgroundColor:
      'rgba(239,68,68,0.08)',

    borderRadius: 13,

    marginHorizontal: 16,
    marginTop: 14,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 8
  },

  resetText: {
    color: colors.danger,

    fontWeight: '800'
  }

});