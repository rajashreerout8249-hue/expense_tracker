import React, { useMemo, useState } from 'react';

import {
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { router } from 'expo-router';
import StreakSavingsChallenge from '../components/StreakSavingsChallenge';
import AIFinancialCopilot from '../components/AIFinancialCopilot';

import Icon from '@expo/vector-icons/Ionicons';

import BottomNav from '../components/BottomNav';
import NaturalLanguageSearch from '../components/NaturalLanguageSearch';

import { useExpense } from '../context/ExpenseContext';

import { colors } from '../theme';

export default function HomeScreen() {
  const {
    transactions,
    notes,
    tasks,
    events,
    reminders,
    todayExpense,
    averageDailyExpense,
    spendingPercentage,
    isHighSpending,
    monthlyBudget,
    monthlySpent,
    monthlyRemaining,
    monthlyPercentage,
    isMonthlyBudgetExceeded,
    isMonthlyBudgetDanger,
    isMonthlyBudgetWarning,
    recurringExpenses,
  } = useExpense();

  const [affordAmount, setAffordAmount] =
    useState('');

  const [affordModalVisible, setAffordModalVisible] =
    useState(false);

  /* =========================
     TOTAL INCOME
  ========================= */

  const totalIncome = useMemo(() => {
    return transactions
      .filter(item => item.type === 'income')
      .reduce(
        (sum, item) =>
          sum + Number(item.amount || 0),
        0
      );
  }, [transactions]);

  /* =========================
     TOTAL EXPENSE
  ========================= */

  const totalExpense = useMemo(() => {
    return transactions
      .filter(item => item.type === 'expense')
      .reduce(
        (sum, item) =>
          sum + Number(item.amount || 0),
        0
      );
  }, [transactions]);

  const balance =
    totalIncome - totalExpense;
    {/* AI FINANCIAL COPILOT */}
{/* ================= EXPENSE STREAK + SAVINGS ================= */}


{/* ================= QUICK ADD ================= */}

{/* QUICK ADD */}
<View style={styles.sectionHeader}>
  <Text style={styles.sectionTitle}>Quick Add</Text>
</View>

  /* =========================
     TODAY
  ========================= */

  const todayDate = new Date()
    .toISOString()
    .split('T')[0];

  const todayTransactions = useMemo(() => {
    return transactions.filter(item => {
      return (
        item.date === todayDate &&
        item.type === 'expense'
      );
    });
  }, [transactions, todayDate]);

  /* =========================
     PENDING TASKS
  ========================= */

  const pendingTasks = useMemo(() => {
    return tasks.filter(task => {
      return !(task as any).completed;
    });
  }, [tasks]);

  /* =========================
     UPCOMING EVENTS
  ========================= */

  const upcomingEvents = useMemo(() => {
    return events.slice(0, 5);
  }, [events]);

  /* =========================
     ACTIVE REMINDERS
  ========================= */

  const activeReminders = useMemo(() => {
    return reminders.slice(0, 5);
  }, [reminders]);

  /* =========================
     RECENT NOTES
  ========================= */

  const recentNotes = useMemo(() => {
    return notes.slice(0, 5);
  }, [notes]);

  /* =========================
     RECENT TRANSACTIONS
  ========================= */

  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 5);
  }, [transactions]);

  /* =========================
     SMART SPEND MESSAGE
  ========================= */

  const smartSpendMessage = useMemo(() => {
    if (isHighSpending) {
      return 'Your spending is higher than usual today. Try to avoid unnecessary expenses.';
    }

    if (
      todayExpense >
        averageDailyExpense &&
      averageDailyExpense > 0
    ) {
      return 'You are spending a little more than your average daily expense.';
    }

    return 'Your spending looks healthy today. Keep maintaining your budget.';
  }, [
    isHighSpending,
    todayExpense,
    averageDailyExpense,
  ]);

  /* =========================
     AFFORD CHECK
  ========================= */

  const affordValue = Number(
    affordAmount || 0
  );

  const canAfford = useMemo(() => {
    if (!affordValue) {
      return null;
    }

    if (
      affordValue <=
      monthlyRemaining
    ) {
      return true;
    }

    return false;
  }, [
    affordValue,
    monthlyRemaining,
  ]);

  return (
    <View style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >

        {/* ================= HEADER ================= */}

        <View style={styles.header}>

          <View>

            <Text
              style={
                styles.smallHeaderText
              }
            >
              Welcome back 👋
            </Text>

            <Text
              style={styles.headerTitle}
            >
              Expense Tracker
            </Text>

          </View>

          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() =>
              router.push(
                '/notifications'
              )
            }
          >

            <Icon
              name="notifications-outline"
              size={24}
              color="#FFFFFF"
            />

          </TouchableOpacity>

        </View>

        {/* ================= BALANCE CARD ================= */}

        <View
          style={styles.balanceCard}
        >

          <Text
            style={styles.balanceLabel}
          >
            Available Balance
          </Text>

          <Text
            style={styles.balanceAmount}
          >
            ₹{balance.toFixed(2)}
          </Text>

          <View
            style={styles.balanceRow}
          >

            <View>

              <Text
                style={
                  styles.balanceSmallLabel
                }
              >
                Income
              </Text>

              <Text
                style={
                  styles.incomeAmount
                }
              >
                ₹{totalIncome.toFixed(2)}
              </Text>

            </View>

            <View>

              <Text
                style={
                  styles.balanceSmallLabel
                }
              >
                Expense
              </Text>

              <Text
                style={
                  styles.expenseAmount
                }
              >
                ₹{totalExpense.toFixed(2)}
              </Text>

            </View>

          </View>

        </View>

        {/* ================= TODAY OVERVIEW ================= */}

        <View
          style={styles.sectionHeader}
        >

          <Text
            style={styles.sectionTitle}
          >
            Today's Overview
          </Text>

        </View>

        <View
          style={styles.overviewRow}
        >

          <View
            style={styles.overviewCard}
          >

            <View
              style={styles.iconCircle}
            >

              <Icon
                name="wallet-outline"
                size={22}
                color={
                  colors.primary ||
                  '#4ADE80'
                }
              />

            </View>

            <Text
              style={styles.cardLabel}
            >
              Today Spent
            </Text>

            <Text
              style={styles.cardAmount}
            >
              ₹
              {Number(
                todayExpense || 0
              ).toFixed(2)}
            </Text>

          </View>

          <View
            style={styles.overviewCard}
          >

            <View
              style={styles.iconCircle}
            >

              <Icon
                name="analytics-outline"
                size={22}
                color={
                  colors.primary ||
                  '#4ADE80'
                }
              />

            </View>

            <Text
              style={styles.cardLabel}
            >
              Average
            </Text>

            <Text
              style={styles.cardAmount}
            >
              ₹
              {Number(
                averageDailyExpense ||
                  0
              ).toFixed(2)}
            </Text>

          </View>

        </View>

        {/* ================= SPENDING PROGRESS ================= */}

        <View
          style={styles.progressCard}
        >

          <View
            style={styles.progressHeader}
          >

            <Text
              style={
                styles.progressTitle
              }
            >
              Today's Spending
            </Text>

            <Text
              style={
                styles.progressPercent
              }
            >
              {Math.round(
                Number(
                  spendingPercentage ||
                    0
                )
              )}
              %
            </Text>

          </View>

          <View
            style={
              styles.progressBackground
            }
          >

            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(
                    Math.max(
                      Number(
                        spendingPercentage ||
                          0
                      ),
                      0
                    ),
                    100
                  )}%`,
                },
              ]}
            />

          </View>

          <Text
            style={
              styles.progressDescription
            }
          >
            {isHighSpending
              ? '⚠️ High spending detected today'
              : '✓ Your spending is under control'}
          </Text>

        </View>

        {/* ================= SMART ASSISTANT ================= */}

        <View
          style={styles.sectionHeader}
        >

          <Text
            style={styles.sectionTitle}
          >
            Smart Spend Assistant
          </Text>

        </View>

        <View
          style={styles.smartCard}
        >

          <View
            style={styles.smartIcon}
          >

            <Icon
              name="bulb-outline"
              size={28}
              color="#FACC15"
            />

          </View>

          <View
            style={styles.smartContent}
          >

            <Text
              style={styles.smartTitle}
            >
              Smart Spend Assistant
            </Text>

            <Text
              style={styles.smartText}
            >
              {smartSpendMessage}
            </Text>

          </View>

        </View>

        {/* ================= CAN I AFFORD ================= */}

        <View
          style={styles.sectionHeader}
        >

          <Text
            style={styles.sectionTitle}
          >
            Can I Afford This?
          </Text>

        </View>

        <TouchableOpacity
          style={styles.affordButton}
          onPress={() =>
            setAffordModalVisible(
              true
            )
          }
        >

          <Icon
            name="help-circle-outline"
            size={24}
            color="#FFFFFF"
          />

          <Text
            style={
              styles.affordButtonText
            }
          >
            Check Before Spending
          </Text>

        </TouchableOpacity>

        {/* ================= MONTHLY BUDGET ================= */}

        <View
          style={styles.sectionHeader}
        >

          <Text
            style={styles.sectionTitle}
          >
            Monthly Spending Limit
          </Text>

        </View>

        <View
          style={styles.budgetCard}
        >

          <View
            style={styles.budgetTopRow}
          >

            <View>

              <Text
                style={styles.budgetLabel}
              >
                Monthly Budget
              </Text>

              <Text
                style={styles.budgetAmount}
              >
                ₹
                {Number(
                  monthlyBudget || 0
                ).toFixed(2)}
              </Text>

            </View>

            <View>

              <Text
                style={styles.budgetLabel}
              >
                Remaining
              </Text>

              <Text
                style={[
                  styles.remainingAmount,
                  monthlyRemaining < 0 &&
                    styles.dangerText,
                ]}
              >
                ₹
                {Number(
                  monthlyRemaining ||
                    0
                ).toFixed(2)}
              </Text>

            </View>

          </View>

          <View
            style={
              styles.progressBackground
            }
          >

            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(
                    Math.max(
                      Number(
                        monthlyPercentage ||
                          0
                      ),
                      0
                    ),
                    100
                  )}%`,
                },
              ]}
            />

          </View>

          <Text
            style={
              styles.budgetSpentText
            }
          >
            ₹
            {Number(
              monthlySpent || 0
            ).toFixed(2)}{' '}
            spent
          </Text>

          {isMonthlyBudgetExceeded && (
            <View
              style={styles.warningBox}
            >

              <Icon
                name="warning-outline"
                size={20}
                color="#EF4444"
              />

              <Text
                style={styles.warningText}
              >
                Monthly budget exceeded.
              </Text>

            </View>
          )}

          {!isMonthlyBudgetExceeded &&
            isMonthlyBudgetDanger && (
              <View
                style={styles.warningBox}
              >

                <Icon
                  name="warning-outline"
                  size={20}
                  color="#F97316"
                />

                <Text
                  style={styles.warningText}
                >
                  You are very close to your monthly limit.
                </Text>

              </View>
            )}

          {!isMonthlyBudgetExceeded &&
            !isMonthlyBudgetDanger &&
            isMonthlyBudgetWarning && (
              <View
                style={styles.infoBox}
              >

                <Icon
                  name="information-circle-outline"
                  size={20}
                  color="#FACC15"
                />

                <Text
                  style={styles.infoText}
                >
                  Your monthly spending is getting high.
                </Text>

              </View>
            )}

        </View>

        {/* ================= RECURRING EXPENSES ================= */}

        <View
          style={styles.sectionHeader}
        >

          <Text
            style={styles.sectionTitle}
          >
            Recurring Expenses
          </Text>

          <TouchableOpacity
            onPress={() =>
              router.push(
                '/recurring-expenses'
              )
            }
          >

            <Text
              style={styles.viewAll}
            >
              View All
            </Text>

          </TouchableOpacity>

        </View>

        {recurringExpenses.length ===
        0 ? (

          <View
            style={styles.emptyCard}
          >

            <Icon
              name="repeat-outline"
              size={30}
              color="#64748B"
            />

            <Text
              style={styles.emptyText}
            >
              No recurring expenses
            </Text>

          </View>

        ) : (

          recurringExpenses
            .slice(0, 3)
            .map(item => (

              <View
                key={item.id}
                style={styles.listCard}
              >

                <View
                  style={styles.listIcon}
                >

                  <Icon
                    name="repeat-outline"
                    size={22}
                    color="#4ADE80"
                  />

                </View>

                <View
                  style={
                    styles.listContent
                  }
                >

                  <Text
                    style={styles.listTitle}
                  >
                    {item.title}
                  </Text>

                  <Text
                    style={
                      styles.listSubtitle
                    }
                  >
                    {item.frequency} •{' '}
                    {item.category}
                  </Text>

                </View>

                <Text
                  style={styles.listAmount}
                >
                  ₹
                  {Number(
                    item.amount || 0
                  ).toFixed(2)}
                </Text>

              </View>

            ))
        )}
        {/* ================= AI FINANCIAL COPILOT ================= */}

<View style={styles.sectionHeader}>
  <Text style={styles.sectionTitle}>
    🤖 AI Financial Copilot
  </Text>
</View>

<AIFinancialCopilot />

<View style={styles.sectionHeader}>
  <Text style={styles.sectionTitle}>
    Challenges & Streaks
  </Text>
</View>

<StreakSavingsChallenge />

{/* ================= QUICK ADD ================= */}

        {/* ================= QUICK ADD ================= */}

        <View
          style={styles.sectionHeader}
        >

          <Text
            style={styles.sectionTitle}
          >
            Quick Add
          </Text>

        </View>

        <View
          style={styles.quickRow}
        >

          <TouchableOpacity
            style={styles.quickButton}
            onPress={() =>
              router.push(
                '/add-transaction'
              )
            }
          >

            <Icon
              name="add-circle-outline"
              size={28}
              color="#4ADE80"
            />

            <Text
              style={styles.quickText}
            >
              Add Expense
            </Text>

          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickButton}
            onPress={() =>
              router.push(
                '/add-transaction'
              )
            }
          >

            <Icon
              name="cash-outline"
              size={28}
              color="#4ADE80"
            />

            <Text
              style={styles.quickText}
            >
              Add Income
            </Text>

          </TouchableOpacity>

        </View>

        {/* ================= SMART EXPENSE SEARCH ================= */}

        <View
          style={styles.sectionHeader}
        >

          <Text
            style={styles.sectionTitle}
          >
            Smart Expense Search
          </Text>

        </View>

        <NaturalLanguageSearch />

        {/* ================= IMPORTANT REMINDERS ================= */}

        <View
          style={styles.sectionHeader}
        >

          <Text
            style={styles.sectionTitle}
          >
            Important Reminders
          </Text>

          <TouchableOpacity
            onPress={() =>
              router.push(
                '/reminders'
              )
            }
          >

            <Text
              style={styles.viewAll}
            >
              View All
            </Text>

          </TouchableOpacity>

        </View>

        {activeReminders.length ===
        0 ? (

          <View
            style={styles.emptyCard}
          >

            <Icon
              name="notifications-off-outline"
              size={30}
              color="#64748B"
            />

            <Text
              style={styles.emptyText}
            >
              No pending reminders
            </Text>

          </View>

        ) : (

          activeReminders.map(
            reminder => (

              <View
                key={reminder.id}
                style={styles.listCard}
              >

                <View
                  style={styles.listIcon}
                >

                  <Icon
                    name="alarm-outline"
                    size={22}
                    color="#FACC15"
                  />

                </View>

                <View
                  style={
                    styles.listContent
                  }
                >

                  <Text
                    style={styles.listTitle}
                  >
                    {reminder.title}
                  </Text>

                  <Text
                    style={
                      styles.listSubtitle
                    }
                  >
                    Upcoming reminder
                  </Text>

                </View>

              </View>

            )
          )
        )}

        {/* ================= TODAY EXPENSES ================= */}

        <View
          style={styles.sectionHeader}
        >

          <Text
            style={styles.sectionTitle}
          >
            Today's Expenses
          </Text>

          <TouchableOpacity
            onPress={() =>
              router.push(
                '/transactions'
              )
            }
          >

            <Text
              style={styles.viewAll}
            >
              View All
            </Text>

          </TouchableOpacity>

        </View>

        {todayTransactions.length ===
        0 ? (

          <View
            style={styles.emptyCard}
          >

            <Icon
              name="receipt-outline"
              size={30}
              color="#64748B"
            />

            <Text
              style={styles.emptyText}
            >
              No expenses today
            </Text>

          </View>

        ) : (

          todayTransactions
            .slice(0, 5)
            .map(item => (

              <View
                key={item.id}
                style={styles.listCard}
              >

                <View
                  style={styles.listIcon}
                >

                  <Icon
                    name="receipt-outline"
                    size={22}
                    color="#F87171"
                  />

                </View>

                <View
                  style={
                    styles.listContent
                  }
                >

                  <Text
                    style={styles.listTitle}
                  >
                    {item.title}
                  </Text>

                  <Text
                    style={
                      styles.listSubtitle
                    }
                  >
                    {item.category}
                  </Text>

                </View>

                <Text
                  style={
                    styles.expenseListAmount
                  }
                >
                  - ₹
                  {Number(
                    item.amount || 0
                  ).toFixed(2)}
                </Text>

              </View>

            ))
        )}

        {/* ================= RECENT NOTES ================= */}

        <View
          style={styles.sectionHeader}
        >

          <Text
            style={styles.sectionTitle}
          >
            Recent Notes
          </Text>

          <TouchableOpacity
            onPress={() =>
              router.push('/Notes')
            }
          >

            <Text
              style={styles.viewAll}
            >
              View All
            </Text>

          </TouchableOpacity>

        </View>

        {recentNotes.length ===
        0 ? (

          <View
            style={styles.emptyCard}
          >

            <Icon
              name="document-text-outline"
              size={30}
              color="#64748B"
            />

            <Text
              style={styles.emptyText}
            >
              No notes available
            </Text>

          </View>

        ) : (

          recentNotes.map(note => (

            <View
              key={note.id}
              style={styles.listCard}
            >

              <View
                style={styles.listIcon}
              >

                <Icon
                  name="document-text-outline"
                  size={22}
                  color="#60A5FA"
                />

              </View>

              <View
                style={
                  styles.listContent
                }
              >

                <Text
                  style={styles.listTitle}
                >
                  {note.title}
                </Text>

                <Text
                  style={styles.listSubtitle}
                  numberOfLines={2}
                >
                  Note available
                </Text>

              </View>

            </View>

          ))
        )}

        {/* ================= PENDING TASKS ================= */}

        <View
          style={styles.sectionHeader}
        >

          <Text
            style={styles.sectionTitle}
          >
            Pending Tasks
          </Text>

          <TouchableOpacity
            onPress={() =>
              router.push('/tasks')
            }
          >

            <Text
              style={styles.viewAll}
            >
              View All
            </Text>

          </TouchableOpacity>

        </View>

        {pendingTasks.length ===
        0 ? (

          <View
            style={styles.emptyCard}
          >

            <Icon
              name="checkmark-done-outline"
              size={30}
              color="#4ADE80"
            />

            <Text
              style={styles.emptyText}
            >
              No pending tasks 🎉
            </Text>

          </View>

        ) : (

          pendingTasks.map(task => (

            <View
              key={task.id}
              style={styles.listCard}
            >

              <View
                style={styles.listIcon}
              >

                <Icon
                  name="checkbox-outline"
                  size={22}
                  color="#A78BFA"
                />

              </View>

              <View
                style={
                  styles.listContent
                }
              >

                <Text
                  style={styles.listTitle}
                >
                  {task.title}
                </Text>

                <Text
                  style={
                    styles.listSubtitle
                  }
                >
                  Pending
                </Text>

              </View>

            </View>

          ))
        )}

        {/* ================= UPCOMING EVENTS ================= */}

        <View
          style={styles.sectionHeader}
        >

          <Text
            style={styles.sectionTitle}
          >
            Upcoming Events
          </Text>

          <TouchableOpacity
            onPress={() =>
              router.push('/events')
            }
          >

            <Text
              style={styles.viewAll}
            >
              View All
            </Text>

          </TouchableOpacity>

        </View>

        {upcomingEvents.length ===
        0 ? (

          <View
            style={styles.emptyCard}
          >

            <Icon
              name="calendar-outline"
              size={30}
              color="#64748B"
            />

            <Text
              style={styles.emptyText}
            >
              No upcoming events
            </Text>

          </View>

        ) : (

          upcomingEvents.map(
            event => (

              <View
                key={event.id}
                style={styles.listCard}
              >

                <View
                  style={styles.listIcon}
                >

                  <Icon
                    name="calendar-outline"
                    size={22}
                    color="#F472B6"
                  />

                </View>

                <View
                  style={
                    styles.listContent
                  }
                >

                  <Text
                    style={styles.listTitle}
                  >
                    {event.title}
                  </Text>

                  <Text
                    style={
                      styles.listSubtitle
                    }
                  >
                    Upcoming event
                  </Text>

                </View>

              </View>

            )
          )
        )}

        {/* ================= ACTIVITY ================= */}

        <View
          style={styles.sectionHeader}
        >

          <Text
            style={styles.sectionTitle}
          >
            Activity Overview
          </Text>

          <TouchableOpacity
            onPress={() =>
              router.push('/activity')
            }
          >

            <Text
              style={styles.viewAll}
            >
              View All
            </Text>

          </TouchableOpacity>

        </View>

        <View
          style={styles.activityCard}
        >

          <View
            style={styles.activityItem}
          >

            <Icon
              name="swap-vertical-outline"
              size={26}
              color="#60A5FA"
            />

            <Text
              style={styles.activityNumber}
            >
              {transactions.length}
            </Text>

            <Text
              style={styles.activityLabel}
            >
              Transactions
            </Text>

          </View>

          <View
            style={styles.activityItem}
          >

            <Icon
              name="document-text-outline"
              size={26}
              color="#A78BFA"
            />

            <Text
              style={styles.activityNumber}
            >
              {notes.length}
            </Text>

            <Text
              style={styles.activityLabel}
            >
              Notes
            </Text>

          </View>

          <View
            style={styles.activityItem}
          >

            <Icon
              name="checkbox-outline"
              size={26}
              color="#4ADE80"
            />

            <Text
              style={styles.activityNumber}
            >
              {pendingTasks.length}
            </Text>

            <Text
              style={styles.activityLabel}
            >
              Tasks
            </Text>

          </View>

        </View>

        {/* ================= RECENT TRANSACTIONS ================= */}

        <View
          style={styles.sectionHeader}
        >

          <Text
            style={styles.sectionTitle}
          >
            Recent Transactions
          </Text>

          <TouchableOpacity
            onPress={() =>
              router.push(
                '/transactions'
              )
            }
          >

            <Text
              style={styles.viewAll}
            >
              View All
            </Text>

          </TouchableOpacity>

        </View>

        {recentTransactions.length ===
        0 ? (

          <View
            style={styles.emptyCard}
          >

            <Icon
              name="wallet-outline"
              size={30}
              color="#64748B"
            />

            <Text
              style={styles.emptyText}
            >
              No transactions
            </Text>

          </View>

        ) : (

          recentTransactions.map(
            item => (

              <View
                key={item.id}
                style={styles.listCard}
              >

                <View
                  style={styles.listIcon}
                >

                  <Icon
                    name={
                      item.type ===
                      'income'
                        ? 'arrow-down-outline'
                        : 'arrow-up-outline'
                    }
                    size={22}
                    color={
                      item.type ===
                      'income'
                        ? '#4ADE80'
                        : '#F87171'
                    }
                  />

                </View>

                <View
                  style={
                    styles.listContent
                  }
                >

                  <Text
                    style={styles.listTitle}
                  >
                    {item.title}
                  </Text>

                  <Text
                    style={
                      styles.listSubtitle
                    }
                  >
                    {item.category}
                  </Text>

                </View>

                <Text
                  style={[
                    styles.listAmount,
                    item.type ===
                      'expense' &&
                      styles.expenseListAmount,
                  ]}
                >
                  {item.type ===
                  'income'
                    ? '+'
                    : '-'}{' '}
                  ₹
                  {Number(
                    item.amount || 0
                  ).toFixed(2)}
                </Text>

              </View>

            )
          )
        )}

        <View
          style={{ height: 110 }}
        />

      </ScrollView>

      {/* ================= FAB ================= */}

      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          router.push(
            '/add-transaction'
          )
        }
      >

        <Icon
          name="add"
          size={30}
          color="#FFFFFF"
        />

      </TouchableOpacity>

      {/* ================= BOTTOM NAV ================= */}

      <BottomNav />

      {/* ================= AFFORD MODAL ================= */}

      <Modal
        visible={
          affordModalVisible
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setAffordModalVisible(
            false
          )
        }
      >

        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : undefined
          }
        >

          <View
            style={styles.modalCard}
          >

            <View
              style={
                styles.modalHeader
              }
            >

              <Text
                style={
                  styles.modalTitle
                }
              >
                Can I Afford This?
              </Text>

              <TouchableOpacity
                onPress={() => {
                  setAffordModalVisible(
                    false
                  );

                  setAffordAmount('');
                }}
              >

                <Icon
                  name="close"
                  size={24}
                  color="#FFFFFF"
                />

              </TouchableOpacity>

            </View>

            <Text
              style={
                styles.modalDescription
              }
            >
              Enter the amount you want to spend.
            </Text>

            <TextInput
              value={affordAmount}
              onChangeText={
                setAffordAmount
              }
              placeholder="Enter amount"
              placeholderTextColor="#64748B"
              keyboardType="numeric"
              style={
                styles.amountInput
              }
            />

            {canAfford !== null && (
              <View
                style={[
                  styles.resultBox,
                  canAfford
                    ? styles.resultSuccess
                    : styles.resultDanger,
                ]}
              >

                <Icon
                  name={
                    canAfford
                      ? 'checkmark-circle-outline'
                      : 'close-circle-outline'
                  }
                  size={28}
                  color={
                    canAfford
                      ? '#4ADE80'
                      : '#F87171'
                  }
                />

                <View
                  style={{ flex: 1 }}
                >

                  <Text
                    style={
                      styles.resultTitle
                    }
                  >
                    {canAfford
                      ? 'Yes, you can afford it'
                      : 'Better avoid this expense'}
                  </Text>

                  <Text
                    style={
                      styles.resultText
                    }
                  >
                    {canAfford
                      ? 'This amount is within your remaining monthly budget.'
                      : 'This amount is higher than your remaining monthly budget.'}
                  </Text>

                </View>

              </View>
            )}

            <TouchableOpacity
              style={
                styles.modalButton
              }
              onPress={() => {
                setAffordAmount('');
                setAffordModalVisible(
                  false
                );
              }}
            >

              <Text
                style={
                  styles.modalButtonText
                }
              >
                Done
              </Text>

            </TouchableOpacity>

          </View>

        </KeyboardAvoidingView>

      </Modal>

    </View>
  );
}

/* =====================================================
   STYLES
===================================================== */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#0B0F17',
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 30,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  smallHeaderText: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 4,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },

  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#161D2A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  balanceCard: {
    backgroundColor: '#151D2A',
    borderRadius: 22,
    padding: 20,
    marginBottom: 24,
  },

  balanceLabel: {
    color: '#94A3B8',
    fontSize: 14,
  },

  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 20,
  },

  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  balanceSmallLabel: {
    color: '#64748B',
    fontSize: 12,
    marginBottom: 4,
  },

  incomeAmount: {
    color: '#4ADE80',
    fontSize: 17,
    fontWeight: '700',
  },

  expenseAmount: {
    color: '#F87171',
    fontSize: 17,
    fontWeight: '700',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },

  viewAll: {
    color: '#4ADE80',
    fontSize: 13,
    fontWeight: '700',
  },

  overviewRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },

  overviewCard: {
    flex: 1,
    backgroundColor: '#151D2A',
    borderRadius: 18,
    padding: 16,
  },

  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  cardLabel: {
    color: '#94A3B8',
    fontSize: 13,
  },

  cardAmount: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 5,
  },

  progressCard: {
    backgroundColor: '#151D2A',
    borderRadius: 18,
    padding: 17,
    marginBottom: 20,
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  progressTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  progressPercent: {
    color: '#4ADE80',
    fontWeight: '800',
  },

  progressBackground: {
    height: 8,
    borderRadius: 8,
    backgroundColor: '#253044',
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#4ADE80',
  },

  progressDescription: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 10,
  },

  smartCard: {
    backgroundColor: '#151D2A',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 20,
  },

  smartIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#27231A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  smartContent: {
    flex: 1,
  },

  smartTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 5,
  },

  smartText: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 19,
  },

  affordButton: {
    backgroundColor: '#16A34A',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  affordButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginLeft: 8,
  },

  budgetCard: {
    backgroundColor: '#151D2A',
    borderRadius: 18,
    padding: 17,
    marginBottom: 20,
  },

  budgetTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  budgetLabel: {
    color: '#64748B',
    fontSize: 12,
    marginBottom: 4,
  },

  budgetAmount: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },

  remainingAmount: {
    color: '#4ADE80',
    fontSize: 20,
    fontWeight: '800',
  },

  dangerText: {
    color: '#F87171',
  },

  budgetSpentText: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 8,
  },

  warningBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#2A1B1B',
    flexDirection: 'row',
    alignItems: 'center',
  },

  warningText: {
    color: '#FCA5A5',
    marginLeft: 8,
    fontSize: 12,
    flex: 1,
  },

  infoBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#28261A',
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoText: {
    color: '#FDE68A',
    marginLeft: 8,
    fontSize: 12,
    flex: 1,
  },

  quickRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },

  quickButton: {
    flex: 1,
    backgroundColor: '#151D2A',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
  },

  quickText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },

  emptyCard: {
    backgroundColor: '#151D2A',
    borderRadius: 18,
    padding: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  emptyText: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 8,
  },

  listCard: {
    backgroundColor: '#151D2A',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  listIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  listContent: {
    flex: 1,
  },

  listTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  listSubtitle: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 4,
  },

  listAmount: {
    color: '#4ADE80',
    fontSize: 14,
    fontWeight: '800',
  },

  expenseListAmount: {
    color: '#F87171',
  },

  activityCard: {
    backgroundColor: '#151D2A',
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  activityItem: {
    flex: 1,
    alignItems: 'center',
  },

  activityNumber: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    marginTop: 7,
  },

  activityLabel: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 3,
  },

  fab: {
    position: 'absolute',
    right: 20,
    bottom: 85,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor:
      'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  modalCard: {
    width: '100%',
    backgroundColor: '#151D2A',
    borderRadius: 22,
    padding: 20,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },

  modalDescription: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 8,
    marginBottom: 18,
  },

  amountInput: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#0B0F17',
    borderWidth: 1,
    borderColor: '#263246',
    paddingHorizontal: 15,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 14,
  },

  resultBox: {
    padding: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  resultSuccess: {
    backgroundColor: '#13251A',
  },

  resultDanger: {
    backgroundColor: '#2A1717',
  },

  resultTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 10,
  },

  resultText: {
    color: '#94A3B8',
    fontSize: 12,
    marginLeft: 10,
    marginTop: 4,
    lineHeight: 17,
  },

  modalButton: {
    backgroundColor: '#16A34A',
    borderRadius: 14,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

});