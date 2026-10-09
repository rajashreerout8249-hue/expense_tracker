import { Ionicons } from '@expo/vector-icons';
import React from 'react';

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { colors } from '../theme';
import { Transaction } from '../types';

type Props = {
  transaction: Transaction;
  onDelete?: () => void;
};

const formatTime = (date: string) => {
  const value = new Date(date);

  return value.toLocaleTimeString(
    'en-IN',
    {
      hour: '2-digit',
      minute: '2-digit'
    }
  );
};

export default function TransactionCard({
  transaction,
  onDelete
}: Props) {
  const income =
    transaction.type === 'income';

  return (
    <View style={styles.card}>
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: income
              ? '#103C2E'
              : '#3A2024'
          }
        ]}
      >
        <Ionicons
          name={
            income
              ? 'arrow-down-outline'
              : 'arrow-up-outline'
          }
          size={22}
          color={
            income
              ? colors.income
              : colors.expense
          }
        />
      </View>

      <View style={styles.info}>
        <Text style={styles.title}>
          {transaction.title}
        </Text>

        <Text style={styles.category}>
          {transaction.category}
        </Text>

        <Text style={styles.time}>
          {formatTime(transaction.date)}
        </Text>
      </View>

      <View style={styles.right}>
        <Text
          style={[
            styles.amount,
            {
              color: income
                ? colors.income
                : colors.white
            }
          ]}
        >
          {income ? '+' : '-'}₹
          {transaction.amount.toLocaleString(
            'en-IN'
          )}
        </Text>

        {onDelete && (
          <TouchableOpacity
            onPress={onDelete}
            style={styles.deleteButton}
          >
            <Ionicons
              name="trash-outline"
              size={17}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 16,
    marginBottom: 10
  },

  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },

  info: {
    flex: 1,
    marginLeft: 12
  },

  title: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700'
  },

  category: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4
  },

  time: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 3
  },

  right: {
    alignItems: 'flex-end'
  },

  amount: {
    fontSize: 14,
    fontWeight: '800'
  },

  deleteButton: {
    marginTop: 8
  }
});