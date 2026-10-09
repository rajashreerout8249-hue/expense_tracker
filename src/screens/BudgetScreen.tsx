import React from 'react';

import {
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

import AppHeader from '../components/AppHeader';
import BottomNav from '../components/BottomNav';
import { useExpense } from '../context/ExpenseContext';
import { colors } from '../theme';

const budgets = [
  {
    name: 'Food',
    limit: 10000,
    icon: '🍔'
  },
  {
    name: 'Shopping',
    limit: 15000,
    icon: '🛍️'
  },
  {
    name: 'Transport',
    limit: 8000,
    icon: '🚗'
  },
  {
    name: 'Entertainment',
    limit: 5000,
    icon: '🎬'
  },
  {
    name: 'Bills',
    limit: 30000,
    icon: '💡'
  },
  {
    name: 'Health',
    limit: 8000,
    icon: '💊'
  }
];

export default function BudgetScreen() {
  const { transactions } = useExpense();

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyExpenses = transactions.filter(item => {
    const date = new Date(item.date);

    return (
      item.type === 'expense' &&
      date.getMonth() === currentMonth &&
      date.getFullYear() === currentYear
    );
  });

  const totalBudget = budgets.reduce(
    (sum, item) => sum + item.limit,
    0
  );

  const totalSpent = monthlyExpenses.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );

  const totalPercentage =
    totalBudget > 0
      ? Math.min((totalSpent / totalBudget) * 100, 100)
      : 0;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader title="Monthly Budget" />

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>
            Monthly Budget
          </Text>

          <Text style={styles.totalAmount}>
            ₹{totalBudget.toLocaleString('en-IN')}
          </Text>

          <Text style={styles.totalSub}>
            Spent ₹{totalSpent.toLocaleString('en-IN')}
          </Text>

          <View style={styles.totalProgressBg}>
            <View
              style={[
                styles.totalProgress,
                {
                  width: `${totalPercentage}%`
                }
              ]}
            />
          </View>

          <Text style={styles.percentageText}>
            {totalPercentage.toFixed(0)}% used
          </Text>
        </View>

        {budgets.map(item => {
          const spent = monthlyExpenses
            .filter(
              transaction =>
                transaction.category === item.name
            )
            .reduce(
              (sum, transaction) =>
                sum + Number(transaction.amount),
              0
            );

          const percentage =
            item.limit > 0
              ? Math.min(spent / item.limit, 1)
              : 0;

          return (
            <View
              style={styles.budgetCard}
              key={item.name}
            >
              <View style={styles.top}>
                <View style={styles.nameRow}>
                  <Text style={styles.icon}>
                    {item.icon}
                  </Text>

                  <View>
                    <Text style={styles.name}>
                      {item.name}
                    </Text>

                    <Text style={styles.small}>
                      ₹{spent.toLocaleString('en-IN')} spent
                    </Text>
                  </View>
                </View>

                <Text style={styles.limit}>
                  ₹{item.limit.toLocaleString('en-IN')}
                </Text>
              </View>

              <View style={styles.progressBackground}>
                <View
                  style={[
                    styles.progress,
                    {
                      width: `${percentage * 100}%`
                    }
                  ]}
                />
              </View>

              <Text style={styles.percent}>
                {(percentage * 100).toFixed(0)}% used
              </Text>
            </View>
          );
        })}
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },

  content: {
    paddingHorizontal: 18,
    paddingBottom: 100
  },

  totalCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 22,
    marginTop: 12,
    marginBottom: 18
  },

  totalLabel: {
    color: '#D1FAE5',
    fontSize: 13
  },

  totalAmount: {
    color: colors.white,
    fontSize: 31,
    fontWeight: '900',
    marginTop: 7
  },

  totalSub: {
    color: '#D1FAE5',
    fontSize: 12,
    marginTop: 5
  },

  totalProgressBg: {
    height: 7,
    backgroundColor: '#047857',
    borderRadius: 10,
    marginTop: 16,
    overflow: 'hidden'
  },

  totalProgress: {
    height: '100%',
    backgroundColor: colors.white,
    borderRadius: 10
  },

  percentageText: {
    color: '#D1FAE5',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 8
  },

  budgetCard: {
    backgroundColor: colors.card,
    borderRadius: 17,
    padding: 17,
    marginBottom: 12
  },

  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },

  icon: {
    fontSize: 25,
    marginRight: 12
  },

  name: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800'
  },

  small: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 4
  },

  limit: {
    color: colors.muted,
    fontSize: 13
  },

  progressBackground: {
    height: 7,
    backgroundColor: colors.border,
    borderRadius: 10,
    marginTop: 16,
    overflow: 'hidden'
  },

  progress: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 10
  },

  percent: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 7
  }
});