import React, { useMemo } from 'react';

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useExpense } from '../src/context/ExpenseContext';
import { colors } from '../src/theme';

export default function ActivityScreen() {
  const {
    transactions,
    tasks,
    events
  } = useExpense();

  const now = new Date();

  const monthName = now.toLocaleDateString(
    'en-IN',
    {
      month: 'long',
      year: 'numeric'
    }
  );

  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Monthly transactions
  const monthlyTransactions = useMemo(() => {
    return transactions.filter(item => {
      const date = new Date(item.date);

      return (
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    });
  }, [
    transactions,
    currentMonth,
    currentYear
  ]);

  // Total income
  const totalIncome = monthlyTransactions
    .filter(item => item.type === 'income')
    .reduce(
      (total, item) => total + item.amount,
      0
    );

  // Total expenses
  const totalExpense = monthlyTransactions
    .filter(item => item.type === 'expense')
    .reduce(
      (total, item) => total + item.amount,
      0
    );

  // Tasks
  const completedTasks = tasks.filter(
    task => task.completed
  ).length;

  const pendingTasks = tasks.filter(
    task => !task.completed
  ).length;

  // Today's date
  const todayDate =
    now.toISOString().split('T')[0];

  // Upcoming events
  const upcomingEvents = events.filter(
    event => event.date >= todayDate
  ).length;

  // Balance
  const balance =
    totalIncome - totalExpense;

  // Expense categories
  const expenseCategories = useMemo(() => {
    const categoryMap: {
      [key: string]: number;
    } = {};

    monthlyTransactions
      .filter(
        item => item.type === 'expense'
      )
      .forEach(item => {
        if (!categoryMap[item.category]) {
          categoryMap[item.category] = 0;
        }

        categoryMap[item.category] +=
          item.amount;
      });

    return Object.entries(categoryMap)
      .sort(
        (a, b) => b[1] - a[1]
      )
      .slice(0, 5);
  }, [monthlyTransactions]);

  // Maximum category amount
  const maxCategoryAmount =
    expenseCategories.length > 0
      ? expenseCategories[0][1]
      : 1;

  return (
    <View style={styles.container}>

      {/* HEADER */}

      <View style={styles.header}>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color={colors.text}
          />
        </TouchableOpacity>

        <View>
          <Text style={styles.headerTitle}>
            Activity
          </Text>

          <Text style={styles.headerSubtitle}>
            Monthly Statistics
          </Text>
        </View>

      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
      >

        {/* MONTH */}

        <View style={styles.monthCard}>

          <View style={styles.monthIcon}>
            <Ionicons
              name="calendar-outline"
              size={23}
              color={colors.green}
            />
          </View>

          <View>

            <Text style={styles.monthLabel}>
              Current Month
            </Text>

            <Text style={styles.monthText}>
              {monthName}
            </Text>

          </View>

        </View>


        {/* FINANCIAL SUMMARY */}

        <Text style={styles.sectionTitle}>
          Financial Summary
        </Text>

        <View style={styles.statsGrid}>

          <StatCard
            icon="arrow-down-circle-outline"
            title="Income"
            value={`₹${totalIncome.toLocaleString(
              'en-IN'
            )}`}
            iconColor={colors.green}
          />

          <StatCard
            icon="arrow-up-circle-outline"
            title="Expenses"
            value={`₹${totalExpense.toLocaleString(
              'en-IN'
            )}`}
            iconColor={colors.danger}
          />

          <StatCard
            icon="wallet-outline"
            title="Balance"
            value={`₹${balance.toLocaleString(
              'en-IN'
            )}`}
            iconColor={
              balance >= 0
                ? colors.green
                : colors.danger
            }
          />

          <StatCard
            icon="receipt-outline"
            title="Transactions"
            value={
              monthlyTransactions.length.toString()
            }
            iconColor={colors.warning}
          />

        </View>


        {/* TASK SUMMARY */}

        <Text style={styles.sectionTitle}>
          Task Activity
        </Text>

        <View style={styles.taskSummary}>

          {/* COMPLETED */}

          <View style={styles.taskBox}>

            <View
              style={[
                styles.taskIcon,
                {
                  backgroundColor:
                    'rgba(16,185,129,0.12)'
                }
              ]}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={23}
                color={colors.green}
              />
            </View>

            <Text style={styles.taskNumber}>
              {completedTasks}
            </Text>

            <Text style={styles.taskLabel}>
              Completed
            </Text>

          </View>


          {/* PENDING */}

          <View style={styles.taskBox}>

            <View
              style={[
                styles.taskIcon,
                {
                  backgroundColor:
                    'rgba(245,158,11,0.12)'
                }
              ]}
            >
              <Ionicons
                name="time-outline"
                size={23}
                color={colors.warning}
              />
            </View>

            <Text style={styles.taskNumber}>
              {pendingTasks}
            </Text>

            <Text style={styles.taskLabel}>
              Pending
            </Text>

          </View>


          {/* EVENTS */}

          <View style={styles.taskBox}>

            <View
              style={[
                styles.taskIcon,
                {
                  backgroundColor:
                    'rgba(59,130,246,0.12)'
                }
              ]}
            >
              <Ionicons
                name="calendar-outline"
                size={23}
                color="#3B82F6"
              />
            </View>

            <Text style={styles.taskNumber}>
              {upcomingEvents}
            </Text>

            <Text style={styles.taskLabel}>
              Events
            </Text>

          </View>

        </View>


        {/* EXPENSE CATEGORIES */}

        <View style={styles.titleRow}>

          <Text style={styles.sectionTitle}>
            Expense Categories
          </Text>

          <Text style={styles.smallText}>
            Top 5
          </Text>

        </View>

        <View style={styles.chartCard}>

          {expenseCategories.length === 0 ? (

            <View style={styles.emptyChart}>

              <Ionicons
                name="bar-chart-outline"
                size={35}
                color={colors.muted}
              />

              <Text style={styles.emptyTitle}>
                No expense data
              </Text>

              <Text style={styles.emptyText}>
                Add expenses to see your
                category statistics.
              </Text>

            </View>

          ) : (

            expenseCategories.map(
              ([category, amount]) => {

                /*
                 * Calculate bar percentage.
                 *
                 * Example:
                 * Maximum expense = 10000
                 * Current category = 5000
                 * Width = 50%
                 */

                const barWidth =
                  Math.max(
                    (amount /
                      maxCategoryAmount) *
                      100,
                    8
                  );

                return (
                  <View
                    key={category}
                    style={styles.chartRow}
                  >

                    {/* CATEGORY NAME + AMOUNT */}

                    <View
                      style={
                        styles.chartLabelRow
                      }
                    >

                      <Text
                        style={
                          styles.categoryText
                        }
                      >
                        {category}
                      </Text>

                      <Text
                        style={
                          styles.categoryAmount
                        }
                      >
                        ₹
                        {amount.toLocaleString(
                          'en-IN'
                        )}
                      </Text>

                    </View>


                    {/* BAR */}

                    <View
                      style={
                        styles.barBackground
                      }
                    >

                      <View
                        style={[
                          styles.bar,
                          {
                            width:
                              `${barWidth}%`
                          }
                        ]}
                      />

                    </View>

                  </View>
                );
              }
            )

          )}

        </View>


        {/* MONTHLY OVERVIEW */}

        <Text style={styles.sectionTitle}>
          Monthly Overview
        </Text>

        <View style={styles.overviewCard}>

          {/* INCOME */}

          <View style={styles.overviewRow}>

            <View style={styles.overviewLeft}>

              <View
                style={[
                  styles.overviewIcon,
                  {
                    backgroundColor:
                      'rgba(16,185,129,0.12)'
                  }
                ]}
              >
                <Ionicons
                  name="trending-up-outline"
                  size={20}
                  color={colors.green}
                />
              </View>

              <View>

                <Text
                  style={
                    styles.overviewTitle
                  }
                >
                  Total Income
                </Text>

                <Text
                  style={
                    styles.overviewSubtitle
                  }
                >
                  This month
                </Text>

              </View>

            </View>

            <Text
              style={[
                styles.overviewAmount,
                {
                  color: colors.green
                }
              ]}
            >
              ₹
              {totalIncome.toLocaleString(
                'en-IN'
              )}
            </Text>

          </View>


          <View style={styles.divider} />


          {/* EXPENSE */}

          <View style={styles.overviewRow}>

            <View style={styles.overviewLeft}>

              <View
                style={[
                  styles.overviewIcon,
                  {
                    backgroundColor:
                      'rgba(239,68,68,0.12)'
                  }
                ]}
              >
                <Ionicons
                  name="trending-down-outline"
                  size={20}
                  color={colors.danger}
                />
              </View>

              <View>

                <Text
                  style={
                    styles.overviewTitle
                  }
                >
                  Total Expenses
                </Text>

                <Text
                  style={
                    styles.overviewSubtitle
                  }
                >
                  This month
                </Text>

              </View>

            </View>

            <Text
              style={[
                styles.overviewAmount,
                {
                  color: colors.danger
                }
              ]}
            >
              ₹
              {totalExpense.toLocaleString(
                'en-IN'
              )}
            </Text>

          </View>


          <View style={styles.divider} />


          {/* TRANSACTIONS */}

          <View style={styles.overviewRow}>

            <View style={styles.overviewLeft}>

              <View
                style={[
                  styles.overviewIcon,
                  {
                    backgroundColor:
                      'rgba(245,158,11,0.12)'
                  }
                ]}
              >
                <Ionicons
                  name="analytics-outline"
                  size={20}
                  color={colors.warning}
                />
              </View>

              <View>

                <Text
                  style={
                    styles.overviewTitle
                  }
                >
                  Total Records
                </Text>

                <Text
                  style={
                    styles.overviewSubtitle
                  }
                >
                  Transactions this month
                </Text>

              </View>

            </View>

            <Text
              style={
                styles.overviewAmount
              }
            >
              {monthlyTransactions.length}
            </Text>

          </View>

        </View>


        <View style={styles.bottomSpace} />

      </ScrollView>

    </View>
  );
}


/* =========================================
   STAT CARD
========================================= */

function StatCard({
  icon,
  title,
  value,
  iconColor
}: {
  icon: any;
  title: string;
  value: string;
  iconColor: string;
}) {

  return (
    <View style={styles.statCard}>

      <View
        style={[
          styles.statIcon,
          {
            backgroundColor:
              `${iconColor}18`
          }
        ]}
      >

        <Ionicons
          name={icon}
          size={22}
          color={iconColor}
        />

      </View>

      <Text style={styles.statTitle}>
        {title}
      </Text>

      <Text style={styles.statValue}>
        {value}
      </Text>

    </View>
  );
}


/* =========================================
   STYLES
========================================= */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: colors.background
  },

  header: {
    height: 72,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },

  headerTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '800'
  },

  headerSubtitle: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2
  },

  content: {
    padding: 18,
    paddingBottom: 40
  },

  /* MONTH */

  monthCard: {
    backgroundColor: colors.card,
    borderRadius: 17,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20
  },

  monthIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor:
      'rgba(16,185,129,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },

  monthLabel: {
    color: colors.muted,
    fontSize: 11
  },

  monthText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 3
  },

  /* SECTION */

  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 11
  },

  /* STAT GRID */

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10
  },

  statCard: {
    width: '48.5%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    marginRight: '1.5%',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border
  },

  statIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },

  statTitle: {
    color: colors.muted,
    fontSize: 10
  },

  statValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
    marginTop: 3
  },

  /* TASK */

  taskSummary: {
    flexDirection: 'row',
    marginBottom: 20
  },

  taskBox: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 15,
    padding: 13,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center'
  },

  taskIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },

  taskNumber: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900'
  },

  taskLabel: {
    color: colors.muted,
    fontSize: 10,
    marginTop: 2
  },

  /* TITLE ROW */

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },

  smallText: {
    color: colors.muted,
    fontSize: 10,
    marginBottom: 11
  },

  /* CHART */

  chartCard: {
    backgroundColor: colors.card,
    borderRadius: 17,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20
  },

  chartRow: {
    marginBottom: 15
  },

  chartLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 7
  },

  categoryText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700'
  },

  categoryAmount: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700'
  },

  barBackground: {
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.surface2,
    overflow: 'hidden'
  },

  bar: {
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.green
  },

  emptyChart: {
    alignItems: 'center',
    paddingVertical: 25
  },

  emptyTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 8
  },

  emptyText: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center'
  },

  /* OVERVIEW */

  overviewCard: {
    backgroundColor: colors.card,
    borderRadius: 17,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.border
  },

  overviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },

  overviewLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },

  overviewIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },

  overviewTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800'
  },

  overviewSubtitle: {
    color: colors.muted,
    fontSize: 10,
    marginTop: 3
  },

  overviewAmount: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900'
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 13
  },

  bottomSpace: {
    height: 20
  }

});