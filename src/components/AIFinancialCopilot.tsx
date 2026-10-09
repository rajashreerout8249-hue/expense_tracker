import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useExpense } from '../context/ExpenseContext';

type TransactionItem = {
  id?: string;
  title?: string;
  amount?: number;
  type?: string;
  category?: string;
  date?: string;
  note?: string;
};

const getToday = () => {
  const date = new Date();

  return (
    date.getFullYear() +
    '-' +
    String(date.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(date.getDate()).padStart(2, '0')
  );
};

const getCurrentMonth = () => {
  const date = new Date();

  return (
    date.getFullYear() +
    '-' +
    String(date.getMonth() + 1).padStart(2, '0')
  );
};

export default function AIFinancialCopilot() {
  const { transactions } = useExpense();

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const transactionList = useMemo(() => {
    return (transactions || []) as TransactionItem[];
  }, [transactions]);

  const analysis = useMemo(() => {
    const month = getCurrentMonth();
    const today = getToday();
    const getTransactionLocalDate = (value?: string) => {
  if (!value) return '';

  // Date-only values should remain unchanged.
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};


    const monthlyTransactions = transactionList.filter((item) =>
      String(item.date || '').startsWith(month)
    );

   const todayTransactions = transactionList.filter(
  (item) => getTransactionLocalDate(item.date) === today
);

    const monthlyExpenses = monthlyTransactions.filter(
      (item) => String(item.type).toLowerCase() === 'expense'
    );

    const monthlyIncome = monthlyTransactions.filter(
      (item) => String(item.type).toLowerCase() === 'income'
    );

    const todayExpenses = todayTransactions.filter(
      (item) => String(item.type).toLowerCase() === 'expense'
    );

    const totalExpense = monthlyExpenses.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    const totalIncome = monthlyIncome.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    const todayExpense = todayExpenses.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    const categoryTotals: Record<string, number> = {};

    monthlyExpenses.forEach((item) => {
      const category = item.category || 'Other';

      categoryTotals[category] =
        (categoryTotals[category] || 0) + Number(item.amount || 0);
    });

    let highestCategory = 'None';
    let highestCategoryAmount = 0;

    Object.entries(categoryTotals).forEach(([category, amount]) => {
      if (amount > highestCategoryAmount) {
        highestCategory = category;
        highestCategoryAmount = amount;
      }
    });

    const balance = totalIncome - totalExpense;

    return {
      totalExpense,
      totalIncome,
      todayExpense,
      balance,
      highestCategory,
      highestCategoryAmount,
      transactionCount: monthlyTransactions.length,
    };
  }, [transactionList]);

  const generateAnswer = (text: string) => {
    const q = text.toLowerCase().trim();

    if (!q) {
      setAnswer('Please ask me something about your finances.');
      return;
    }

    if (
      q.includes('today') &&
      (q.includes('spend') ||
        q.includes('expense') ||
        q.includes('spent') ||
        q.includes('kharcha'))
    ) {
      setAnswer(
        `Today you have spent ₹${analysis.todayExpense.toLocaleString(
          'en-IN'
        )}.`
      );
      return;
    }

    if (
      q.includes('month') &&
      (q.includes('spend') ||
        q.includes('expense') ||
        q.includes('spent') ||
        q.includes('kharcha'))
    ) {
      setAnswer(
        `This month your total expense is ₹${analysis.totalExpense.toLocaleString(
          'en-IN'
        )}.`
      );
      return;
    }

    if (
      q.includes('income') ||
      q.includes('earned') ||
      q.includes('earning') ||
      q.includes('salary')
    ) {
      setAnswer(
        `Your income recorded this month is ₹${analysis.totalIncome.toLocaleString(
          'en-IN'
        )}.`
      );
      return;
    }

    if (
      q.includes('balance') ||
      q.includes('left') ||
      q.includes('remaining')
    ) {
      setAnswer(
        `Based on your recorded income and expenses, your current monthly balance is approximately ₹${analysis.balance.toLocaleString(
          'en-IN'
        )}.`
      );
      return;
    }

    if (
      q.includes('highest') ||
      q.includes('most') ||
      q.includes('where') ||
      q.includes('category')
    ) {
      if (analysis.highestCategory === 'None') {
        setAnswer('I do not have enough expense data to identify your highest spending category.');
      } else {
        setAnswer(
          `Your highest spending category this month is ${analysis.highestCategory}, with ₹${analysis.highestCategoryAmount.toLocaleString(
            'en-IN'
          )} spent.`
        );
      }
      return;
    }

    if (
      q.includes('save') ||
      q.includes('saving') ||
      q.includes('savings')
    ) {
      if (analysis.balance > 0) {
        setAnswer(
          `You currently have approximately ₹${analysis.balance.toLocaleString(
            'en-IN'
          )} left after recorded expenses. Try to keep a part of it as savings and avoid unnecessary spending.`
        );
      } else {
        setAnswer(
          `Your recorded expenses are currently equal to or higher than your income. Try reducing non-essential expenses before increasing spending.`
        );
      }
      return;
    }

    if (
      q.includes('advice') ||
      q.includes('suggest') ||
      q.includes('should i') ||
      q.includes('recommend')
    ) {
      if (analysis.balance < 0) {
        setAnswer(
          `⚠️ Your expenses are higher than your recorded income. Focus on reducing ${analysis.highestCategory} spending and review your recent transactions.`
        );
      } else if (analysis.highestCategory !== 'None') {
        setAnswer(
          `💡 Your biggest spending area is ${analysis.highestCategory}. Review this category first if you want to save more money.`
        );
      } else {
        setAnswer(
          `💡 Keep recording all your transactions. Once more data is available, I can give you better spending advice.`
        );
      }

      return;
    }

    if (
      q.includes('can i afford') ||
      q.includes('afford')
    ) {
      const amountMatch = q.match(/(?:₹|rs\.?|rupees?)?\s*(\d+(?:\.\d+)?)/i);

      if (!amountMatch) {
        setAnswer(
          'Tell me the amount, for example: "Can I afford ₹5000?"'
        );
        return;
      }

      const requestedAmount = Number(amountMatch[1]);

      if (requestedAmount <= analysis.balance && analysis.balance > 0) {
        setAnswer(
          `✅ Based only on your recorded monthly balance, ₹${requestedAmount.toLocaleString(
            'en-IN'
          )} appears affordable. You would have approximately ₹${(
            analysis.balance - requestedAmount
          ).toLocaleString('en-IN')} remaining.`
        );
      } else {
        setAnswer(
          `⚠️ I would be careful with ₹${requestedAmount.toLocaleString(
            'en-IN'
          )}. Your recorded balance is ₹${analysis.balance.toLocaleString(
            'en-IN'
          )}.`
        );
      }

      return;
    }

    if (
      q.includes('summary') ||
      q.includes('report') ||
      q.includes('how am i doing')
    ) {
      setAnswer(
        `📊 Monthly Summary\n\n` +
          `Income: ₹${analysis.totalIncome.toLocaleString('en-IN')}\n` +
          `Expenses: ₹${analysis.totalExpense.toLocaleString('en-IN')}\n` +
          `Balance: ₹${analysis.balance.toLocaleString('en-IN')}\n` +
          `Top category: ${analysis.highestCategory}\n` +
          `Transactions: ${analysis.transactionCount}`
      );
      return;
    }

    setAnswer(
      `I can help with:\n\n` +
        `• Today's spending\n` +
        `• Monthly expenses\n` +
        `• Income\n` +
        `• Remaining balance\n` +
        `• Highest spending category\n` +
        `• Savings advice\n` +
        `• "Can I afford ₹5000?"\n` +
        `• Monthly summary`
    );
  };

  const askQuestion = () => {
    generateAnswer(question);
  };

  const askQuickQuestion = (text: string) => {
    setQuestion(text);
    generateAnswer(text);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.aiTitle}>🤖 AI Financial Copilot</Text>
          <Text style={styles.subtitle}>
            Ask me anything about your expenses
          </Text>
        </View>

        <View style={styles.aiBadge}>
          <Text style={styles.aiBadgeText}>AI</Text>
        </View>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          value={question}
          onChangeText={setQuestion}
          placeholder="Ask: How much did I spend today?"
          placeholderTextColor="#888"
          style={styles.input}
          returnKeyType="done"
          onSubmitEditing={askQuestion}
        />

        <Pressable style={styles.askButton} onPress={askQuestion}>
          <Text style={styles.askButtonText}>Ask</Text>
        </Pressable>
      </View>

      <Text style={styles.quickTitle}>Quick Questions</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickContainer}
      >
        <Pressable
          style={styles.quickButton}
          onPress={() => askQuickQuestion('How much did I spend today?')}
        >
          <Text style={styles.quickText}>💸 Today</Text>
        </Pressable>

        <Pressable
          style={styles.quickButton}
          onPress={() => askQuickQuestion('How much did I spend this month?')}
        >
          <Text style={styles.quickText}>📊 Monthly</Text>
        </Pressable>

        <Pressable
          style={styles.quickButton}
          onPress={() => askQuickQuestion('Where am I spending the most?')}
        >
          <Text style={styles.quickText}>🔎 Top Spending</Text>
        </Pressable>

        <Pressable
          style={styles.quickButton}
          onPress={() => askQuickQuestion('Give me savings advice')}
        >
          <Text style={styles.quickText}>💰 Save More</Text>
        </Pressable>
      </ScrollView>

      {answer ? (
        <View style={styles.answerCard}>
          <View style={styles.answerHeader}>
            <Text style={styles.answerIcon}>🤖</Text>
            <Text style={styles.answerTitle}>Copilot Answer</Text>
          </View>

          <Text style={styles.answerText}>{answer}</Text>
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>💬</Text>

          <Text style={styles.emptyTitle}>
            Ask your financial copilot
          </Text>

          <Text style={styles.emptyText}>
            Try asking about your spending, income, balance or savings.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 18,
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  aiTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111827',
  },

  subtitle: {
    marginTop: 4,
    fontSize: 12,
    color: '#6B7280',
  },

  aiBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
  },

  aiBadgeText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#4ADE80',
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  input: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    color: '#111827',
    backgroundColor: '#F9FAFB',
    fontSize: 14,
  },

  askButton: {
    marginLeft: 8,
    minHeight: 48,
    paddingHorizontal: 17,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4ADE80',
  },

  askButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  quickTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },

  quickContainer: {
    paddingRight: 8,
  },

  quickButton: {
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },

  quickText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },

  answerCard: {
    marginTop: 16,
    padding: 15,
    borderRadius: 16,
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },

  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
  },

  answerIcon: {
    fontSize: 20,
    marginRight: 7,
  },

  answerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#4ADE80',
  },

  answerText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#4ADE80',
  },

  emptyCard: {
    marginTop: 16,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },

  emptyIcon: {
    fontSize: 30,
    marginBottom: 8,
  },

  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },

  emptyText: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    color: '#6B7280',
  },
});