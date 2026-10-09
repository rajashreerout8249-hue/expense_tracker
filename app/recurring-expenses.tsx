import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useExpense } from '../src/context/ExpenseContext';
import { colors } from '../src/theme';
import { RecurringFrequency } from '../src/types';

const CATEGORIES = [
  'Bills',
  'Rent',
  'EMI',
  'Food',
  'Travel',
  'Shopping',
  'Health',
  'Entertainment',
  'Other',
];

const FREQUENCIES: RecurringFrequency[] = [
  'Daily',
  'Weekly',
  'Monthly',
  'Yearly',
];

export default function RecurringExpensesScreen() {
  const router = useRouter();

  const {
    recurringExpenses,
    addRecurringExpense,
    deleteRecurringExpense,
    toggleRecurringExpense,
  } = useExpense();

  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Bills');
  const [frequency, setFrequency] =
    useState<RecurringFrequency>('Monthly');

  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setCategory('Bills');
    setFrequency('Monthly');
    setStartDate(
      new Date().toISOString().split('T')[0]
    );
  };

  const getNextDueDate = (
    dateString: string,
    selectedFrequency: RecurringFrequency
  ) => {
    const date = new Date(dateString);

    if (selectedFrequency === 'Daily') {
      date.setDate(date.getDate() + 1);
    }

    if (selectedFrequency === 'Weekly') {
      date.setDate(date.getDate() + 7);
    }

    if (selectedFrequency === 'Monthly') {
      date.setMonth(date.getMonth() + 1);
    }

    if (selectedFrequency === 'Yearly') {
      date.setFullYear(date.getFullYear() + 1);
    }

    return date.toISOString().split('T')[0];
  };

  const handleAdd = () => {
    const cleanTitle = title.trim();
    const numericAmount = Number(amount);

    if (!cleanTitle) {
      Alert.alert(
        'Missing Title',
        'Please enter expense title.'
      );
      return;
    }

    if (
      !amount.trim() ||
      Number.isNaN(numericAmount) ||
      numericAmount <= 0
    ) {
      Alert.alert(
        'Invalid Amount',
        'Please enter a valid amount.'
      );
      return;
    }

    if (!startDate.trim()) {
      Alert.alert(
        'Missing Date',
        'Please enter start date.'
      );
      return;
    }

    const nextDueDate = getNextDueDate(
      startDate,
      frequency
    );

    addRecurringExpense({
      title: cleanTitle,
      amount: numericAmount,
      category,
      frequency,
      startDate,
      nextDueDate,
      active: true,
    });

    resetForm();
    setShowForm(false);

    Alert.alert(
      'Success',
      'Recurring expense added successfully.'
    );
  };

  const formatDate = (value: string) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Recurring Expense',
      'Are you sure you want to delete this expense?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteRecurringExpense(id),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={colors.text}
          />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>
            Recurring Expenses
          </Text>

          <Text style={styles.headerSubtitle}>
            Manage your regular payments
          </Text>
        </View>

        <Pressable
          style={styles.addHeaderButton}
          onPress={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <Ionicons
            name="add"
            size={25}
            color="#FFFFFF"
          />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons
              name="repeat"
              size={24}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>
              Regular Payments
            </Text>

            <Text style={styles.infoDescription}>
              Keep track of rent, EMI, subscriptions,
              bills and other regular expenses.
            </Text>
          </View>
        </View>

        {/* Add Form */}
        {showForm && (
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>
                Add Recurring Expense
              </Text>

              <Pressable
                onPress={() => {
                  resetForm();
                  setShowForm(false);
                }}
              >
                <Ionicons
                  name="close"
                  size={23}
                  color={colors.textSecondary}
                />
              </Pressable>
            </View>

            <Text style={styles.label}>
              Expense Title
            </Text>

            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Netflix, Rent, EMI"
              placeholderTextColor="#7E8799"
              style={styles.input}
            />

            <Text style={styles.label}>
              Amount
            </Text>

            <View style={styles.amountInput}>
              <Text style={styles.rupee}>₹</Text>

              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="Enter amount"
                placeholderTextColor="#7E8799"
                keyboardType="numeric"
                style={styles.amountTextInput}
              />
            </View>

            <Text style={styles.label}>
              Category
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {CATEGORIES.map((item) => {
                const selected = category === item;

                return (
                  <Pressable
                    key={item}
                    style={[
                      styles.chip,
                      selected && styles.chipSelected,
                    ]}
                    onPress={() => setCategory(item)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selected &&
                          styles.chipTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={styles.label}>
              Frequency
            </Text>

            <View style={styles.frequencyGrid}>
              {FREQUENCIES.map((item) => {
                const selected =
                  frequency === item;

                return (
                  <Pressable
                    key={item}
                    style={[
                      styles.frequencyButton,
                      selected &&
                        styles.frequencySelected,
                    ]}
                    onPress={() =>
                      setFrequency(item)
                    }
                  >
                    <Ionicons
                      name={
                        item === 'Daily'
                          ? 'today-outline'
                          : item === 'Weekly'
                          ? 'calendar-outline'
                          : item === 'Monthly'
                          ? 'calendar-number-outline'
                          : 'time-outline'
                      }
                      size={18}
                      color={
                        selected
                          ? '#FFFFFF'
                          : colors.textSecondary
                      }
                    />

                    <Text
                      style={[
                        styles.frequencyText,
                        selected &&
                          styles.frequencyTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.label}>
              Start Date
            </Text>

            <View style={styles.dateInput}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={colors.textSecondary}
              />

              <TextInput
                value={startDate}
                onChangeText={setStartDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#7E8799"
                style={styles.dateTextInput}
              />
            </View>

            <Pressable
              style={styles.saveButton}
              onPress={handleAdd}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={21}
                color="#FFFFFF"
              />

              <Text style={styles.saveButtonText}>
                Add Recurring Expense
              </Text>
            </Pressable>
          </View>
        )}

        {/* List Header */}
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>
            Your Recurring Expenses
          </Text>

          <Text style={styles.countText}>
            {recurringExpenses.length}
          </Text>
        </View>

        {/* Empty State */}
        {recurringExpenses.length === 0 && (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="repeat-outline"
                size={35}
                color="#7E8799"
              />
            </View>

            <Text style={styles.emptyTitle}>
              No recurring expenses
            </Text>

            <Text style={styles.emptyText}>
              Add your regular expenses like rent,
              EMI or subscriptions.
            </Text>

            <Pressable
              style={styles.emptyButton}
              onPress={() => {
                resetForm();
                setShowForm(true);
              }}
            >
              <Ionicons
                name="add"
                size={20}
                color="#FFFFFF"
              />

              <Text style={styles.emptyButtonText}>
                Add Expense
              </Text>
            </Pressable>
          </View>
        )}

        {/* Expense List */}
        {recurringExpenses.map((item) => (
          <View
            key={item.id}
            style={[
              styles.expenseCard,
              !item.active &&
                styles.expenseCardInactive,
            ]}
          >
            <View style={styles.expenseTop}>
              <View style={styles.categoryIcon}>
                <Ionicons
                  name="repeat"
                  size={23}
                  color="#FFFFFF"
                />
              </View>

              <View style={styles.expenseMain}>
                <Text style={styles.expenseTitle}>
                  {item.title}
                </Text>

                <Text style={styles.expenseCategory}>
                  {item.category} • {item.frequency}
                </Text>
              </View>

              <Text style={styles.expenseAmount}>
                ₹{Number(item.amount).toLocaleString('en-IN')}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailsRow}>
              <View>
                <Text style={styles.detailLabel}>
                  Next Due
                </Text>

                <Text style={styles.detailValue}>
                  {formatDate(item.nextDueDate)}
                </Text>
              </View>

              <View>
                <Text style={styles.detailLabel}>
                  Started
                </Text>

                <Text style={styles.detailValue}>
                  {formatDate(item.startDate)}
                </Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              <Pressable
                style={[
                  styles.statusButton,
                  item.active
                    ? styles.activeButton
                    : styles.inactiveButton,
                ]}
                onPress={() =>
                  toggleRecurringExpense(item.id)
                }
              >
                <Ionicons
                  name={
                    item.active
                      ? 'checkmark-circle'
                      : 'pause-circle'
                  }
                  size={18}
                  color={
                    item.active
                      ? '#63D391'
                      : '#9CA3AF'
                  }
                />

                <Text
                  style={[
                    styles.statusText,
                    {
                      color: item.active
                        ? '#63D391'
                        : '#9CA3AF',
                    },
                  ]}
                >
                  {item.active
                    ? 'Active'
                    : 'Paused'}
                </Text>
              </Pressable>

              <Pressable
                style={styles.deleteButton}
                onPress={() =>
                  handleDelete(item.id)
                }
              >
                <Ionicons
                  name="trash-outline"
                  size={19}
                  color="#FF6B6B"
                />

                <Text style={styles.deleteText}>
                  Delete
                </Text>
              </Pressable>
            </View>
          </View>
        ))}

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 55,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#202838',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerText: {
    flex: 1,
    marginLeft: 12,
  },

  headerTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },

  headerSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 3,
  },

  addHeaderButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: {
    padding: 18,
  },

  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#263044',
  },

  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoText: {
    flex: 1,
    marginLeft: 13,
  },

  infoTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },

  infoDescription: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },

  formCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 17,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#263044',
  },

  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  formTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },

  label: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 8,
  },

  input: {
    height: 50,
    backgroundColor: '#171D2A',
    borderRadius: 13,
    paddingHorizontal: 14,
    color: colors.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#293246',
  },

  amountInput: {
    height: 50,
    backgroundColor: '#171D2A',
    borderRadius: 13,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#293246',
  },

  rupee: {
    color: colors.green,
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },

  amountTextInput: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
  },

  horizontalList: {
    paddingRight: 10,
  },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#171D2A',
    borderWidth: 1,
    borderColor: '#293246',
    marginRight: 8,
  },

  chipSelected: {
    backgroundColor: colors.green,
    borderColor: colors.green,
  },

  chipText: {
    color: colors.textSecondary,
    fontSize: 12,
  },

  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  frequencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  frequencyButton: {
    width: '48%',
    height: 45,
    borderRadius: 12,
    backgroundColor: '#171D2A',
    borderWidth: 1,
    borderColor: '#293246',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    marginRight: '2%',
  },

  frequencySelected: {
    backgroundColor: colors.green,
    borderColor: colors.green,
  },

  frequencyText: {
    color: colors.textSecondary,
    fontSize: 13,
    marginLeft: 7,
  },

  frequencyTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  dateInput: {
    height: 50,
    backgroundColor: '#171D2A',
    borderRadius: 13,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#293246',
  },

  dateTextInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    marginLeft: 10,
  },

  saveButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.green,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },

  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },

  countText: {
    color: colors.textSecondary,
    backgroundColor: colors.card,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    fontSize: 12,
  },

  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#263044',
  },

  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 22,
    backgroundColor: '#171D2A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  emptyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },

  emptyText: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 7,
  },

  emptyButton: {
    height: 45,
    paddingHorizontal: 18,
    borderRadius: 13,
    backgroundColor: colors.green,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
  },

  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    marginLeft: 6,
  },

  expenseCard: {
    backgroundColor: colors.card,
    borderRadius: 19,
    padding: 16,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#263044',
  },

  expenseCardInactive: {
    opacity: 0.65,
  },

  expenseTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  categoryIcon: {
    width: 47,
    height: 47,
    borderRadius: 15,
    backgroundColor: '#2C6B52',
    alignItems: 'center',
    justifyContent: 'center',
  },

  expenseMain: {
    flex: 1,
    marginLeft: 12,
  },

  expenseTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },

  expenseCategory: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },

  expenseAmount: {
    color: '#FF7777',
    fontSize: 15,
    fontWeight: '700',
  },

  divider: {
    height: 1,
    backgroundColor: '#293246',
    marginVertical: 14,
  },

  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  detailLabel: {
    color: colors.textSecondary,
    fontSize: 11,
  },

  detailValue: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },

  statusButton: {
    flex: 1,
    height: 40,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeButton: {
    backgroundColor: '#19382B',
  },

  inactiveButton: {
    backgroundColor: '#252A35',
  },

  statusText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },

  deleteButton: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 11,
    backgroundColor: '#351F24',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  deleteText: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 5,
  },

  bottomSpace: {
    height: 40,
  },
});