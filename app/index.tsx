import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';

import { router } from 'expo-router';

import HomeScreen from '../src/screens/HomeScreen';
import { isLoggedIn } from '../src/api/authApi';

export default function Index() {
  const [checking, setChecking] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    try {
      const value = await isLoggedIn();

      setLoggedIn(value);

      if (!value) {
        router.replace('/login');
        return;
      }

      setChecking(false);
    } catch (error) {
      console.log('Login check error:', error);

      setLoggedIn(false);
      setChecking(false);

      router.replace('/login');
    }
  };

  if (checking) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#FFFFFF"
        />
      </View>
    );
  }

  if (!loggedIn) {
    return null;
  }

  return <HomeScreen />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B0F17',
  },
});