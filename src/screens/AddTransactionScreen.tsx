import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';

import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { router } from 'expo-router';

import { useExpense } from '../context/ExpenseContext';
import { colors } from '../theme';
import { TransactionType } from '../types';

export default function AddTransactionScreen() {
  const { addTransaction } =
    useExpense();

  const [type, setType] =
    useState<TransactionType>('expense');

  const [title, setTitle] =
    useState('');

  const [amount, setAmount] =
    useState('');

  const [category, setCategory] =
    useState('Food');

  const [note, setNote] =
    useState('');

  const categories = [
    'Food',
    'Shopping',
    'Transport',
    'Bills',
    'Health',
    'Entertainment',
    'Salary',
    'Business'
  ];

  const saveTransaction = () => {
    if (!title.trim()) {
      Alert.alert(
        'Error',
        'Please enter title'
      );

      return;
    }

    if (
      !amount ||
      Number(amount) <= 0
    ) {
      Alert.alert(
        'Error',
        'Please enter valid amount'
      );

      return;
    }

    const newTransaction = {
      id: Date.now().toString(),

      title: title.trim(),

      amount: Number(amount),

      type,

      category,

      date: new Date().toISOString(),

      note: note.trim()
    };

    addTransaction(
      newTransaction
    );

    Alert.alert(
      'Success',
      'Transaction added successfully',
      [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={25}
            color={colors.white}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Add Transaction
        </Text>

        <View style={{ width: 25 }} />
      </View>

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.label}>
          Transaction Type
        </Text>

        <View style={styles.typeRow}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === 'expense' &&
                styles.activeExpense
            ]}
            onPress={() =>
              setType('expense')
            }
          >
            <Ionicons
              name="arrow-up-outline"
              size={20}
              color={
                type === 'expense'
                  ? colors.white
                  : colors.textSecondary
              }
            />

            <Text
              style={[
                styles.typeText,
                type === 'expense' &&
                  styles.activeText
              ]}
            >
              Expense
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeButton,
              type === 'income' &&
                styles.activeIncome
            ]}
            onPress={() =>
              setType('income')
            }
          >
            <Ionicons
              name="arrow-down-outline"
              size={20}
              color={
                type === 'income'
                  ? colors.white
                  : colors.textSecondary
              }
            />

            <Text
              style={[
                styles.typeText,
                type === 'income' &&
                  styles.activeText
              ]}
            >
              Income
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>
          Title
        </Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. Grocery Shopping"
          placeholderTextColor={
            colors.textSecondary
          }
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>
          Amount
        </Text>

        <TextInput
          style={styles.input}
          placeholder="₹ 0"
          placeholderTextColor={
            colors.textSecondary
          }
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <Text style={styles.label}>
          Category
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {categories.map(item => (
            <TouchableOpacity
              key={item}
              style={[
                styles.category,
                category === item &&
                  styles.selectedCategory
              ]}
              onPress={() =>
                setCategory(item)
              }
            >
              <Text
                style={[
                  styles.categoryText,
                  category === item &&
                    styles.selectedCategoryText
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>
          Note
        </Text>

        <TextInput
          style={[
            styles.input,
            styles.noteInput
          ]}
          placeholder="Add a note..."
          placeholderTextColor={
            colors.textSecondary
          }
          value={note}
          onChangeText={setNote}
          multiline
        />

        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveTransaction}
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={22}
            color={colors.white}
          />

          <Text style={styles.saveText}>
            Save Transaction
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },

  header: {
    height: 65,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },

  headerTitle: {
    color: colors.white,
    fontSize: 19,
    fontWeight: '800'
  },

  content: {
    padding: 18,
    paddingBottom: 40
  },

  label: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 9
  },

  typeRow: {
    flexDirection: 'row',
    gap: 10
  },

  typeButton: {
    flex: 1,
    height: 55,
    borderRadius: 14,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7
  },

  activeExpense: {
    backgroundColor: colors.red
  },

  activeIncome: {
    backgroundColor: colors.primary
  },

  typeText: {
    color: colors.textSecondary,
    fontWeight: '700'
  },

  activeText: {
    color: colors.white
  },

  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 15,
    color: colors.white,
    fontSize: 15
  },

  noteInput: {
    height: 100,
    paddingTop: 14,
    textAlignVertical: 'top'
  },

  category: {
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 8
  },

  selectedCategory: {
    backgroundColor: colors.primary
  },

  categoryText: {
    color: colors.textSecondary,
    fontSize: 12
  },

  selectedCategoryText: {
    color: colors.white,
    fontWeight: '700'
  },

  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 15,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
    flexDirection: 'row',
    gap: 8
  },

  saveText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800'
  }
});