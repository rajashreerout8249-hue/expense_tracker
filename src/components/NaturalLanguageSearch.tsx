import React, { useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useExpense } from '../context/ExpenseContext';

const getToday = () => {
  const date = new Date();

  return date.toISOString().split('T')[0];
};

const getMonth = () => {
  const date = new Date();

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, '0')}`;
};

export default function NaturalLanguageSearch() {
  const { transactions } = useExpense();

  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();

    if (!q) {
      return [];
    }

    const today = getToday();
    const month = getMonth();

    const wantsToday = q.includes('today');

    const wantsYesterday = q.includes('yesterday');

    const wantsMonth =
      q.includes('this month') ||
      q.includes('monthly');

    const wantsExpense =
      q.includes('expense') ||
      q.includes('expenses') ||
      q.includes('spent') ||
      q.includes('spending') ||
      q.includes('paid');

    const wantsIncome =
      q.includes('income') ||
      q.includes('earned') ||
      q.includes('received');

    const amountMatch = q.match(
      /(?:above|over|more than|greater than|below|under|less than)\s*(?:₹|rs\.?|rupees?)?\s*(\d+)/i
    );

    const amount = amountMatch
      ? Number(amountMatch[1])
      : null;

    const amountAbove =
      !!amountMatch &&
      (
        q.includes('above') ||
        q.includes('over') ||
        q.includes('more than') ||
        q.includes('greater than')
      );

    const amountBelow =
      !!amountMatch &&
      (
        q.includes('below') ||
        q.includes('under') ||
        q.includes('less than')
      );

    const categories: Record<string, string[]> = {
      food: [
        'food',
        'swiggy',
        'zomato',
        'restaurant',
        'lunch',
        'dinner',
      ],

      travel: [
        'travel',
        'uber',
        'ola',
        'fuel',
        'petrol',
        'bus',
        'train',
      ],

      shopping: [
        'shopping',
        'amazon',
        'flipkart',
        'clothes',
      ],

      health: [
        'health',
        'medicine',
        'hospital',
        'doctor',
      ],

      bills: [
        'bill',
        'bills',
        'electricity',
        'recharge',
        'internet',
      ],
    };

    let selectedCategory: string | null = null;

    Object.entries(categories).forEach(
      ([category, words]) => {
        if (
          words.some(word =>
            q.includes(word)
          )
        ) {
          selectedCategory = category;
        }
      }
    );

    return transactions.filter(
      (transaction: any) => {
        const transactionDate = String(
          transaction.date || ''
        );

        const transactionText = `
          ${transaction.title || ''}
          ${transaction.category || ''}
          ${transaction.note || ''}
        `.toLowerCase();

        /* TODAY */

        if (
          wantsToday &&
          transactionDate !== today
        ) {
          return false;
        }

        /* YESTERDAY */

        if (wantsYesterday) {
          const yesterday = new Date();

          yesterday.setDate(
            yesterday.getDate() - 1
          );

          const yesterdayString =
            yesterday
              .toISOString()
              .split('T')[0];

          if (
            transactionDate !==
            yesterdayString
          ) {
            return false;
          }
        }

        /* THIS MONTH */

        if (
          wantsMonth &&
          !transactionDate.startsWith(month)
        ) {
          return false;
        }

        /* EXPENSE */

        if (
          wantsExpense &&
          transaction.type !== 'expense'
        ) {
          return false;
        }

        /* INCOME */

        if (
          wantsIncome &&
          transaction.type !== 'income'
        ) {
          return false;
        }

        /* AMOUNT ABOVE */

        if (
          amount !== null &&
          amountAbove &&
          Number(transaction.amount) <= amount
        ) {
          return false;
        }

        /* AMOUNT BELOW */

        if (
          amount !== null &&
          amountBelow &&
          Number(transaction.amount) >= amount
        ) {
          return false;
        }

        /* CATEGORY */

        if (selectedCategory) {
          const words =
            categories[selectedCategory];

          const categoryMatched =
            words.some(word =>
              transactionText.includes(word)
            );

          if (!categoryMatched) {
            return false;
          }
        }

        /* EXTRA SEARCH WORDS */

        const searchWords = q
          .replace(
            /today|yesterday|this month|monthly|expenses?|spent|spending|paid|income|earned|received|above|over|more than|greater than|below|under|less than/gi,
            ''
          )
          .replace(/\d+/g, '')
          .trim();

        if (
          searchWords &&
          !transactionText.includes(searchWords)
        ) {
          const words = searchWords
            .split(/\s+/)
            .filter(Boolean);

          const matched = words.some(word =>
            transactionText.includes(word)
          );

          if (!matched) {
            return false;
          }
        }

        return true;
      }
    );
  }, [query, transactions]);

  const total = results.reduce(
    (sum: number, item: any) =>
      sum + Number(item.amount || 0),
    0
  );

  const clearSearch = () => {
    setQuery('');
  };

  return (
    <View style={styles.container}>

      {/* TITLE */}

      <View style={styles.headerRow}>
        <View style={styles.titleArea}>
          <Text style={styles.title}>
            🔍 Smart Expense Search
          </Text>

          <Text style={styles.subtitle}>
            Search your expenses using normal language
          </Text>
        </View>

        {query ? (
          <Pressable
            onPress={clearSearch}
            style={styles.clearButton}
          >
            <Text style={styles.clearText}>
              Clear
            </Text>
          </Pressable>
        ) : null}
      </View>

      {/* SEARCH INPUT */}

      <View style={styles.inputBox}>

        <Text style={styles.searchIcon}>
          🔍
        </Text>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="e.g. food expenses above 500"
          placeholderTextColor="#77808F"
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
        />

      </View>

      {/* EXAMPLES */}

      <Text style={styles.exampleLabel}>
        Try searching:
      </Text>

      <View style={styles.examples}>

        <Pressable
          style={styles.exampleButton}
          onPress={() =>
            setQuery('show today expenses')
          }
        >
          <Text style={styles.exampleText}>
            Today
          </Text>
        </Pressable>

        <Pressable
          style={styles.exampleButton}
          onPress={() =>
            setQuery('food expenses')
          }
        >
          <Text style={styles.exampleText}>
            Food
          </Text>
        </Pressable>

        <Pressable
          style={styles.exampleButton}
          onPress={() =>
            setQuery('travel this month')
          }
        >
          <Text style={styles.exampleText}>
            Travel
          </Text>
        </Pressable>

      </View>

      <View style={styles.examples}>

        <Pressable
          style={styles.exampleButton}
          onPress={() =>
            setQuery('shopping expenses')
          }
        >
          <Text style={styles.exampleText}>
            Shopping
          </Text>
        </Pressable>

        <Pressable
          style={styles.exampleButton}
          onPress={() =>
            setQuery('income')
          }
        >
          <Text style={styles.exampleText}>
            Income
          </Text>
        </Pressable>

        <Pressable
          style={styles.exampleButton}
          onPress={() =>
            setQuery('food expenses above 500')
          }
        >
          <Text style={styles.exampleText}>
            Above ₹500
          </Text>
        </Pressable>

      </View>

      {/* SUMMARY */}

      {query ? (
        <View style={styles.summary}>

          <View>
            <Text style={styles.count}>
              {results.length} result
              {results.length === 1
                ? ''
                : 's'}
            </Text>

            <Text style={styles.summaryLabel}>
              Matching transactions
            </Text>
          </View>

          <View>
            <Text style={styles.totalLabel}>
              Total
            </Text>

            <Text style={styles.total}>
              ₹{total.toFixed(2)}
            </Text>
          </View>

        </View>
      ) : null}

      {/* EMPTY */}

      {query &&
      results.length === 0 ? (
        <View style={styles.emptyBox}>

          <Text style={styles.emptyIcon}>
            🔎
          </Text>

          <Text style={styles.emptyTitle}>
            No matching transactions
          </Text>

          <Text style={styles.emptyText}>
            Try another search like
            "food expenses" or
            "today expenses".
          </Text>

        </View>
      ) : null}

      {/* RESULTS */}

      {results
        .slice(0, 8)
        .map(
          (
            item: any,
            index: number
          ) => (
            <View
              key={
                item.id ||
                item._id ||
                String(index)
              }
              style={styles.resultCard}
            >

              <View style={styles.resultIcon}>
                <Text>
                  {item.type === 'income'
                    ? '💰'
                    : '💳'}
                </Text>
              </View>

              <View style={styles.resultLeft}>

                <Text
                  style={styles.itemTitle}
                  numberOfLines={1}
                >
                  {item.title || 'Transaction'}
                </Text>

                <Text style={styles.itemMeta}>
                  {item.category || 'Other'}
                  {' • '}
                  {item.date || ''}
                </Text>

              </View>

              <Text
                style={[
                  styles.amount,
                  item.type === 'income'
                    ? styles.income
                    : styles.expense,
                ]}
              >
                {item.type === 'income'
                  ? '+'
                  : '-'}
                ₹
                {Number(
                  item.amount || 0
                ).toFixed(2)}
              </Text>

            </View>
          )
        )}

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    backgroundColor: '#101722',
    borderRadius: 18,
    padding: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#202A38',
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  titleArea: {
    flex: 1,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },

  subtitle: {
    color: '#8993A3',
    fontSize: 12,
    marginTop: 5,
    marginBottom: 12,
  },

  clearButton: {
    backgroundColor: '#263246',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },

  clearText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  inputBox: {
    minHeight: 50,
    backgroundColor: '#151D29',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  searchIcon: {
    fontSize: 17,
    marginRight: 8,
  },

  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    paddingVertical: 10,
  },

  exampleLabel: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 13,
    marginBottom: 7,
  },

  examples: {
    flexDirection: 'row',
    marginBottom: 4,
  },

  exampleButton: {
    backgroundColor: '#1B2635',
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 7,
    marginBottom: 7,
  },

  exampleText: {
    color: '#D1D5DB',
    fontSize: 12,
    fontWeight: '600',
  },

  summary: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#151D29',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  count: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  summaryLabel: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 3,
  },

  totalLabel: {
    color: '#64748B',
    fontSize: 10,
    textAlign: 'right',
  },

  total: {
    color: '#4ADE80',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },

  emptyBox: {
    alignItems: 'center',
    paddingVertical: 18,
  },

  emptyIcon: {
    fontSize: 25,
  },

  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 7,
  },

  emptyText: {
    color: '#64748B',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 16,
  },

  resultCard: {
    backgroundColor: '#151D29',
    borderRadius: 12,
    padding: 12,
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },

  resultIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  resultLeft: {
    flex: 1,
  },

  itemTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  itemMeta: {
    color: '#7F8998',
    fontSize: 11,
    marginTop: 3,
  },

  amount: {
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 8,
  },

  income: {
    color: '#45C77A',
  },

  expense: {
    color: '#FF6B6B',
  },

});