import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

type VoiceExpenseEntryProps = {
  onExpenseReady?: (data: {
    title: string;
    amount: number;
    category: string;
    type: 'expense' | 'income';
    date: string;
    note: string;
  }) => void;
};

const getToday = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const detectCategory = (text: string) => {
  const value = text.toLowerCase();

  if (
    value.includes('swiggy') ||
    value.includes('zomato') ||
    value.includes('food') ||
    value.includes('restaurant') ||
    value.includes('lunch') ||
    value.includes('dinner') ||
    value.includes('breakfast')
  ) {
    return 'Food';
  }

  if (
    value.includes('uber') ||
    value.includes('ola') ||
    value.includes('bus') ||
    value.includes('train') ||
    value.includes('travel') ||
    value.includes('petrol') ||
    value.includes('fuel')
  ) {
    return 'Travel';
  }

  if (
    value.includes('amazon') ||
    value.includes('flipkart') ||
    value.includes('shopping') ||
    value.includes('clothes')
  ) {
    return 'Shopping';
  }

  if (
    value.includes('medicine') ||
    value.includes('hospital') ||
    value.includes('doctor') ||
    value.includes('medical')
  ) {
    return 'Health';
  }

  if (
    value.includes('electricity') ||
    value.includes('water bill') ||
    value.includes('internet') ||
    value.includes('recharge') ||
    value.includes('bill')
  ) {
    return 'Bills';
  }

  return 'Other';
};

const parseVoiceText = (text: string) => {
  const lower = text.toLowerCase();

  const amountMatch = lower.match(
    /(?:₹|rs\.?|rupees?|inr)?\s*(\d+(?:\.\d+)?)/i
  );

  const amount = amountMatch
    ? Number(amountMatch[1])
    : 0;

  let type: 'expense' | 'income' = 'expense';

  if (
    lower.includes('received') ||
    lower.includes('earned') ||
    lower.includes('salary') ||
    lower.includes('income') ||
    lower.includes('got')
  ) {
    type = 'income';
  }

  let title = text.trim();

  if (amountMatch) {
    title = title
      .replace(amountMatch[0], '')
      .replace(
        /\b(i|spent|spend|paid|pay|rupees?|rs\.?|inr|received|earned|got|today|yesterday)\b/gi,
        ''
      )
      .replace(/\s+/g, ' ')
      .trim();
  }

  if (!title) {
    title = 'Voice Transaction';
  }

  return {
    title,
    amount,
    category: detectCategory(text),
    type,
    date: getToday(),
    note: text,
  };
};

export default function VoiceExpenseEntry({
  onExpenseReady,
}: VoiceExpenseEntryProps) {
  const [visible, setVisible] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Other');
  const [type, setType] = useState<'expense' | 'income'>('expense');

  useSpeechRecognitionEvent('start', () => {
    setListening(true);
  });

  useSpeechRecognitionEvent('end', () => {
    setListening(false);
  });

  useSpeechRecognitionEvent('result', (event) => {
    const text =
      event.results?.[0]?.transcript || '';

    if (text) {
      setVoiceText(text);

      const parsed = parseVoiceText(text);

      setTitle(parsed.title);
      setAmount(
        parsed.amount > 0
          ? String(parsed.amount)
          : ''
      );
      setCategory(parsed.category);
      setType(parsed.type);
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    setListening(false);

    Alert.alert(
      'Voice Error',
      event.error || 'Unable to recognize your voice.'
    );
  });

  const startVoice = async () => {
    try {
      const permission =
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Microphone Permission',
          'Please allow microphone permission to use voice expense entry.'
        );

        return;
      }

      setVoiceText('');
      setTitle('');
      setAmount('');
      setCategory('Other');
      setType('expense');

      await ExpoSpeechRecognitionModule.start({
        lang: 'en-IN',
        interimResults: true,
        continuous: false,
      });
    } catch (error) {
      console.log('Voice start error:', error);

      Alert.alert(
        'Voice Error',
        'Could not start voice recognition.'
      );
    }
  };

  const stopVoice = async () => {
    try {
      await ExpoSpeechRecognitionModule.stop();
    } catch (error) {
      console.log('Voice stop error:', error);
    }

    setListening(false);
  };

  const saveVoiceExpense = () => {
    const numericAmount = Number(amount);

    if (!title.trim()) {
      Alert.alert(
        'Missing Title',
        'Please enter a transaction title.'
      );
      return;
    }

    if (!numericAmount || numericAmount <= 0) {
      Alert.alert(
        'Invalid Amount',
        'Please enter a valid amount.'
      );
      return;
    }

    const data = {
      title: title.trim(),
      amount: numericAmount,
      category,
      type,
      date: getToday(),
      note: voiceText,
    };

    onExpenseReady?.(data);

    setVisible(false);
    setVoiceText('');
    setTitle('');
    setAmount('');
    setCategory('Other');
    setType('expense');
  };

  return (
    <>
      <Pressable
        style={styles.voiceButton}
        onPress={() => setVisible(true)}
      >
        <Text style={styles.micIcon}>🎙️</Text>

        <View>
          <Text style={styles.voiceTitle}>
            Voice Expense
          </Text>

          <Text style={styles.voiceSubtitle}>
            Speak your expense
          </Text>
        </View>
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>
                🎙️ Voice Expense
              </Text>

              <Pressable
                onPress={() => {
                  if (listening) {
                    stopVoice();
                  }

                  setVisible(false);
                }}
              >
                <Text style={styles.close}>
                  ✕
                </Text>
              </Pressable>
            </View>

            <Text style={styles.example}>
              Example:
              {' '}
              "I spent 350 rupees on Swiggy today"
            </Text>

            <Pressable
              style={[
                styles.recordButton,
                listening && styles.recordingButton,
              ]}
              onPress={
                listening
                  ? stopVoice
                  : startVoice
              }
            >
              <Text style={styles.recordIcon}>
                {listening ? '⏹️' : '🎙️'}
              </Text>

              <Text style={styles.recordText}>
                {listening
                  ? 'Stop Listening'
                  : 'Start Speaking'}
              </Text>
            </Pressable>

            {voiceText ? (
              <View style={styles.voiceBox}>
                <Text style={styles.smallLabel}>
                  Voice Text
                </Text>

                <Text style={styles.voiceResult}>
                  {voiceText}
                </Text>
              </View>
            ) : null}

            <Text style={styles.label}>
              Title
            </Text>

            <TextInput
              value={title}
              onChangeText={setTitle}
              style={styles.input}
              placeholder="Transaction title"
              placeholderTextColor="#777"
            />

            <Text style={styles.label}>
              Amount
            </Text>

            <TextInput
              value={amount}
              onChangeText={setAmount}
              style={styles.input}
              placeholder="Amount"
              placeholderTextColor="#777"
              keyboardType="numeric"
            />

            <Text style={styles.label}>
              Category
            </Text>

            <TextInput
              value={category}
              onChangeText={setCategory}
              style={styles.input}
              placeholder="Category"
              placeholderTextColor="#777"
            />

            <View style={styles.typeRow}>
              <Pressable
                style={[
                  styles.typeButton,
                  type === 'expense' &&
                    styles.selectedType,
                ]}
                onPress={() => setType('expense')}
              >
                <Text style={styles.typeText}>
                  Expense
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.typeButton,
                  type === 'income' &&
                    styles.selectedType,
                ]}
                onPress={() => setType('income')}
              >
                <Text style={styles.typeText}>
                  Income
                </Text>
              </Pressable>
            </View>

            <Pressable
              style={styles.saveButton}
              onPress={saveVoiceExpense}
            >
              <Text style={styles.saveText}>
                Save Transaction
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  voiceButton: {
    backgroundColor: '#151B26',
    borderRadius: 18,
    padding: 16,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#252D3A',
  },

  micIcon: {
    fontSize: 30,
    marginRight: 14,
  },

  voiceTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },

  voiceSubtitle: {
    color: '#8E98A8',
    fontSize: 13,
    marginTop: 3,
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },

  modal: {
    backgroundColor: '#0B0F17',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    maxHeight: '92%',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
  },

  close: {
    color: '#FFFFFF',
    fontSize: 22,
  },

  example: {
    color: '#9AA4B2',
    fontSize: 13,
    marginTop: 10,
    lineHeight: 20,
  },

  recordButton: {
    backgroundColor: '#26334A',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 18,
  },

  recordingButton: {
    backgroundColor: '#8B2020',
  },

  recordIcon: {
    fontSize: 28,
  },

  recordText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 5,
  },

  voiceBox: {
    backgroundColor: '#151B26',
    borderRadius: 14,
    padding: 13,
    marginTop: 14,
  },

  smallLabel: {
    color: '#7F8A9B',
    fontSize: 11,
    marginBottom: 5,
  },

  voiceResult: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },

  label: {
    color: '#AAB3C0',
    fontSize: 12,
    marginTop: 12,
    marginBottom: 5,
  },

  input: {
    backgroundColor: '#151B26',
    borderWidth: 1,
    borderColor: '#283141',
    borderRadius: 12,
    color: '#FFFFFF',
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 14,
  },

  typeRow: {
    flexDirection: 'row',
    marginTop: 14,
  },

  typeButton: {
    flex: 1,
    backgroundColor: '#151B26',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    marginHorizontal: 4,
  },

  selectedType: {
    backgroundColor: '#2E6B52',
  },

  typeText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  saveButton: {
    backgroundColor: '#2E8B57',
    paddingVertical: 15,
    borderRadius: 13,
    alignItems: 'center',
    marginTop: 18,
  },

  saveText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});