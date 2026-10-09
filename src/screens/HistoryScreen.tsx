import React, { useMemo, useState } from 'react';

import {
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

import AppHeader from '../components/AppHeader';
import BottomNav from '../components/BottomNav';
import FilterChip from '../components/FilterChip';
import TransactionCard from '../components/TransactionCard';

import { useExpense } from '../context/ExpenseContext';
import { colors } from '../theme';

type FilterType = 'All' | 'Income' | 'Expense';

export default function HistoryScreen() {
  const { transactions } = useExpense();

  const [filter, setFilter] =
    useState<FilterType>('All');

  const filteredTransactions = useMemo(() => {
    if (filter === 'All') {
      return transactions;
    }

    if (filter === 'Income') {
      return transactions.filter(
        item => item.type === 'income'
      );
    }

    return transactions.filter(
      item => item.type === 'expense'
    );
  }, [transactions, filter]);

  const groupedTransactions = useMemo(() => {
    const groups: {
      [key: string]: typeof filteredTransactions;
    } = {};

    filteredTransactions.forEach(item => {
      const date = new Date(item.date);

      const today = new Date();

      const yesterday = new Date();
      yesterday.setDate(
        yesterday.getDate() - 1
      );

      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() ===
          today.getFullYear();

      const isYesterday =
        date.getDate() ===
          yesterday.getDate() &&
        date.getMonth() ===
          yesterday.getMonth() &&
        date.getFullYear() ===
          yesterday.getFullYear();

      let groupName = '';

      if (isToday) {
        groupName = 'Today';
      } else if (isYesterday) {
        groupName = 'Yesterday';
      } else {
        groupName = date.toLocaleDateString(
          'en-IN',
          {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }
        );
      }

      if (!groups[groupName]) {
        groups[groupName] = [];
      }

      groups[groupName].push(item);
    });

    return groups;
  }, [filteredTransactions]);

  const groupEntries =
    Object.entries(groupedTransactions);

  return (
    <View style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
      >

        {/* HEADER */}

        <AppHeader
          title="Transaction History"
          subtitle="All your transactions"
        />

        {/* FILTERS */}

        <View style={styles.filterSection}>

          <Text style={styles.filterTitle}>
            Filter
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.filters
            }
          >

            <FilterChip
              title="All"
              active={filter === 'All'}
              onPress={() =>
                setFilter('All')
              }
            />

            <FilterChip
              title="Income"
              active={filter === 'Income'}
              onPress={() =>
                setFilter('Income')
              }
            />

            <FilterChip
              title="Expense"
              active={filter === 'Expense'}
              onPress={() =>
                setFilter('Expense')
              }
            />

          </ScrollView>

        </View>

        {/* TRANSACTIONS */}

        {groupEntries.length === 0 ? (

          <View style={styles.empty}>

            <Text style={styles.emptyIcon}>
              🧾
            </Text>

            <Text style={styles.emptyTitle}>
              No transactions found
            </Text>

            <Text style={styles.emptyText}>
              Your transactions will appear
              here after you add them.
            </Text>

          </View>

        ) : (

          groupEntries.map(
            ([groupName, items]) => (

              <View
                key={groupName}
                style={styles.group}
              >

                <View
                  style={styles.groupHeader}
                >

                  <Text
                    style={
                      styles.groupTitle
                    }
                  >
                    {groupName}
                  </Text>

                  <Text
                    style={
                      styles.groupCount
                    }
                  >
                    {items.length}{' '}
                    {items.length === 1
                      ? 'transaction'
                      : 'transactions'}
                  </Text>

                </View>

                {items.map(item => (

                  <TransactionCard
                    key={item.id}
                    transaction={item}
                  />

                ))}

              </View>

            )
          )

        )}

      </ScrollView>

      {/* BOTTOM NAV */}

      <BottomNav />

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor:
      colors.background
  },

  content: {
    paddingBottom: 105
  },

  filterSection: {
    paddingHorizontal: 18,
    marginTop: 12,
    marginBottom: 18
  },

  filterTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10
  },

  filters: {
    paddingRight: 18
  },

  group: {
    paddingHorizontal: 18,
    marginBottom: 20
  },

  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginBottom: 10
  },

  groupTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800'
  },

  groupCount: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600'
  },

  empty: {
    marginHorizontal: 18,
    marginTop: 55,
    padding: 30,

    borderRadius: 20,

    backgroundColor:
      colors.card,

    alignItems: 'center'
  },

  emptyIcon: {
    fontSize: 45,
    marginBottom: 15
  },

  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center'
  },

  emptyText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,

    textAlign: 'center',

    marginTop: 8
  }

});