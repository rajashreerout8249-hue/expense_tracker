import { Transaction } from './types';

const today = new Date();

const getDate = (daysAgo: number) => {
  const date = new Date();

  date.setDate(today.getDate() - daysAgo);

  return date.toISOString();
};

export const initialTransactions: Transaction[] = [
  {
    id: '1',
    title: 'Swiggy Delights',
    amount: 350,
    type: 'expense',
    category: 'Food',
    date: getDate(0)
  },

  {
    id: '2',
    title: 'Shell Petrol Station',
    amount: 500,
    type: 'expense',
    category: 'Transport',
    date: getDate(0)
  },

  {
    id: '3',
    title: 'Fresh Mart Grocery',
    amount: 450,
    type: 'expense',
    category: 'Shopping',
    date: getDate(1)
  },

  {
    id: '4',
    title: 'Consulting Payment',
    amount: 8561,
    type: 'income',
    category: 'Business',
    date: getDate(1)
  },

  {
    id: '5',
    title: 'Monthly Tech Salary',
    amount: 8500,
    type: 'income',
    category: 'Salary',
    date: getDate(2)
  },

  {
    id: '6',
    title: 'Amazon Prime',
    amount: 299,
    type: 'expense',
    category: 'Entertainment',
    date: getDate(2)
  },

  {
    id: '7',
    title: 'Apollo Pharmacy',
    amount: 620,
    type: 'expense',
    category: 'Health',
    date: getDate(3)
  },

  {
    id: '8',
    title: 'Urban Housing Rent',
    amount: 2500,
    type: 'expense',
    category: 'Bills',
    date: getDate(4)
  }
];