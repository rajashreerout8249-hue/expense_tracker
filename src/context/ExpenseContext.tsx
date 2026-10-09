import AsyncStorage from '@react-native-async-storage/async-storage';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { initialTransactions } from '../data';

import {
  Transaction,
  Note,
  Task,
  EventItem,
  Reminder,
  RecurringExpense,
} from '../types';

import {
  getTransactions,
  addTransactionApi,
  deleteTransactionApi,
} from '../api/api';


// ==================================================
// CONTEXT TYPE
// ==================================================

type ExpenseContextType = {

  // TRANSACTIONS
  transactions: Transaction[];

  addTransaction: (transaction: Transaction) => Promise<void>;

  deleteTransaction:
    (id: string) => void;

  clearAllTransactions:
    () => void;

  resetData:
    () => void;

  // SMART SPEND
  todayExpense: number;

  averageDailyExpense: number;

  spendingPercentage: number;

  isHighSpending: boolean;

  // MONTHLY SPENDING LIMIT
  monthlyBudget: number;

  monthlySpent: number;

  monthlyRemaining: number;

  monthlyPercentage: number;

  isMonthlyBudgetExceeded: boolean;

  isMonthlyBudgetDanger: boolean;

  isMonthlyBudgetWarning: boolean;

  // RECURRING EXPENSES
  recurringExpenses: RecurringExpense[];

  addRecurringExpense:
    (expense: Omit<RecurringExpense, 'id'>) => void;

  deleteRecurringExpense:
    (id: string) => void;

  toggleRecurringExpense:
    (id: string) => void;

  // NOTES
  notes: Note[];

  addNote:
    (note: Note) => void;

  updateNote:
    (note: Note) => void;

  deleteNote:
    (id: string) => void;

  togglePinNote:
    (id: string) => void;

  // TASKS
  tasks: Task[];

  addTask:
    (task: Task) => void;

  updateTask:
    (task: Task) => void;

  deleteTask:
    (id: string) => void;

  toggleTask:
    (id: string) => void;

  // EVENTS
  events: EventItem[];

  addEvent:
    (event: EventItem) => void;

  updateEvent:
    (event: EventItem) => void;

  deleteEvent:
    (id: string) => void;

  // REMINDERS
  reminders: Reminder[];

  addReminder:
    (reminder: Reminder) => void;

  updateReminder:
    (reminder: Reminder) => void;

  deleteReminder:
    (id: string) => void;

  completeReminder:
    (id: string) => void;

  snoozeReminder:
    (id: string, minutes: number) => void;

  rescheduleReminder:
    (
      id: string,
      date: string,
      time: string
    ) => void;
};


// ==================================================
// CREATE CONTEXT
// ==================================================

const ExpenseContext =
  createContext<
    ExpenseContextType | undefined
  >(undefined);


// ==================================================
// PROVIDER
// ==================================================

export function ExpenseProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  // =================================================
  // STATES
  // =================================================

  const [
    transactions,
    setTransactions,
  ] =
    useState<Transaction[]>([]);

  const [
    notes,
    setNotes,
  ] =
    useState<Note[]>([]);

  const [
    tasks,
    setTasks,
  ] =
    useState<Task[]>([]);

  const [
    events,
    setEvents,
  ] =
    useState<EventItem[]>([]);

  const [
    reminders,
    setReminders,
  ] =
    useState<Reminder[]>([]);

  const [
    recurringExpenses,
    setRecurringExpenses,
  ] =
    useState<RecurringExpense[]>([]);

  const [
    loaded,
    setLoaded,
  ] =
    useState(false);


  // =================================================
  // LOAD DATA
  // =================================================

  useEffect(() => {

    loadData();

  }, []);


  // =================================================
  // SAVE TRANSACTIONS LOCALLY
  // =================================================

  useEffect(() => {

    if (!loaded) return;

    AsyncStorage.setItem(
      'transactions',
      JSON.stringify(transactions)
    ).catch(error => {
      console.log(
        'Save transactions error:',
        error
      );
    });

  }, [
    transactions,
    loaded,
  ]);


  // =================================================
  // SAVE NOTES
  // =================================================

  useEffect(() => {

    if (!loaded) return;

    AsyncStorage.setItem(
      'notes',
      JSON.stringify(notes)
    );

  }, [
    notes,
    loaded,
  ]);


  // =================================================
  // SAVE TASKS
  // =================================================

  useEffect(() => {

    if (!loaded) return;

    AsyncStorage.setItem(
      'tasks',
      JSON.stringify(tasks)
    );

  }, [
    tasks,
    loaded,
  ]);


  // =================================================
  // SAVE EVENTS
  // =================================================

  useEffect(() => {

    if (!loaded) return;

    AsyncStorage.setItem(
      'events',
      JSON.stringify(events)
    );

  }, [
    events,
    loaded,
  ]);


  // =================================================
  // SAVE REMINDERS
  // =================================================

  useEffect(() => {

    if (!loaded) return;

    AsyncStorage.setItem(
      'reminders',
      JSON.stringify(reminders)
    );

  }, [
    reminders,
    loaded,
  ]);


  // =================================================
  // SAVE RECURRING EXPENSES
  // =================================================

  useEffect(() => {

    if (!loaded) return;

    AsyncStorage.setItem(
      'recurringExpenses',
      JSON.stringify(recurringExpenses)
    );

  }, [
    recurringExpenses,
    loaded,
  ]);


  // =================================================
  // LOAD ALL DATA
  // =================================================

  const loadData = async () => {

    try {

      // =============================================
      // LOCAL TRANSACTIONS
      // =============================================

      const savedTransactions =
        await AsyncStorage.getItem(
          'transactions'
        );

      let localTransactions: Transaction[] = [];

      if (savedTransactions) {

        try {

          localTransactions =
            JSON.parse(
              savedTransactions
            );

        } catch {

          localTransactions = [];
        }

      }


      // =============================================
      // BACKEND TRANSACTIONS
      // =============================================

      try {

        const backendResponse =
          await getTransactions();

        const backendTransactions =
          Array.isArray(
            backendResponse
          )
            ? backendResponse
            : Array.isArray(
                backendResponse?.transactions
              )
              ? backendResponse.transactions
              : [];


        // -------------------------------------------
        // CONVERT MONGODB _id TO APP id
        // -------------------------------------------

        const normalizedTransactions:
          Transaction[] =
          backendTransactions.map(
            (item: any) => ({
              ...item,

              id:
                String(
                  item.id ||
                  item._id
                ),
            })
          );


        // -------------------------------------------
        // BACKEND HAS DATA
        // -------------------------------------------

        if (
          normalizedTransactions.length > 0
        ) {

          setTransactions(
            normalizedTransactions
          );

        }

        // -------------------------------------------
        // BACKEND EMPTY
        // KEEP LOCAL DATA
        // -------------------------------------------

        else if (
          localTransactions.length > 0
        ) {

          setTransactions(
            localTransactions
          );

        }

        else {

          setTransactions(
            initialTransactions
          );

        }

      } catch (error) {

        console.log(
          'Backend transaction load failed:',
          error
        );


        // -------------------------------------------
        // BACKEND FAILS
        // USE LOCAL DATA
        // -------------------------------------------

        if (
          localTransactions.length > 0
        ) {

          setTransactions(
            localTransactions
          );

        } else {

          setTransactions(
            initialTransactions
          );

        }

      }


      // =============================================
      // NOTES
      // =============================================

      const savedNotes =
        await AsyncStorage.getItem(
          'notes'
        );

      if (savedNotes) {

        setNotes(
          JSON.parse(
            savedNotes
          )
        );

      }


      // =============================================
      // TASKS
      // =============================================

      const savedTasks =
        await AsyncStorage.getItem(
          'tasks'
        );

      if (savedTasks) {

        setTasks(
          JSON.parse(
            savedTasks
          )
        );

      }


      // =============================================
      // EVENTS
      // =============================================

      const savedEvents =
        await AsyncStorage.getItem(
          'events'
        );

      if (savedEvents) {

        setEvents(
          JSON.parse(
            savedEvents
          )
        );

      }


      // =============================================
      // REMINDERS
      // =============================================

      const savedReminders =
        await AsyncStorage.getItem(
          'reminders'
        );

      if (savedReminders) {

        setReminders(
          JSON.parse(
            savedReminders
          )
        );

      }


      // =============================================
      // RECURRING EXPENSES
      // =============================================

      const savedRecurringExpenses =
        await AsyncStorage.getItem(
          'recurringExpenses'
        );

      if (savedRecurringExpenses) {

        setRecurringExpenses(
          JSON.parse(
            savedRecurringExpenses
          )
        );

      }

    } catch (error) {

      console.log(
        'Load data error:',
        error
      );

      setTransactions(
        initialTransactions
      );

    } finally {

      setLoaded(true);

    }

  };


  // =================================================
  // TRANSACTION FUNCTIONS
  // =================================================

  const addTransaction = async (
    transaction: Transaction
  ) => {

    // -----------------------------------------------
    // SHOW IMMEDIATELY IN APP
    // -----------------------------------------------

    setTransactions(
      previous => [
        transaction,
        ...previous,
      ]
    );


    // -----------------------------------------------
    // SAVE TO BACKEND
    // -----------------------------------------------

    try {

      const response =
        await addTransactionApi(
          transaction
        );


      const savedTransaction =
        response?.transaction ||
        response;


      if (
        savedTransaction
      ) {

        const serverTransaction:
          Transaction = {

          ...savedTransaction,

          id:
            String(
              savedTransaction.id ||
              savedTransaction._id ||
              transaction.id
            ),

        };


        // -----------------------------------------
        // REPLACE LOCAL TEMP TRANSACTION
        // WITH MONGODB TRANSACTION
        // -----------------------------------------

        setTransactions(
          previous =>
            previous.map(
              item =>
                item.id ===
                transaction.id
                  ? serverTransaction
                  : item
            )
        );

      }

    } catch (error) {

      console.log(
        'Add transaction backend error:',
        error
      );

      // ---------------------------------------------
      // IMPORTANT:
      // LOCAL TRANSACTION REMAINS
      // ---------------------------------------------

    }

  };


  // =================================================
  // DELETE TRANSACTION
  // =================================================

  const deleteTransaction = async (
    id: string
  ) => {

    // -----------------------------------------------
    // REMOVE FROM UI IMMEDIATELY
    // -----------------------------------------------

    setTransactions(
      previous =>
        previous.filter(
          item =>
            item.id !== id
        )
    );


    // -----------------------------------------------
    // DELETE FROM BACKEND
    // -----------------------------------------------

    try {

      await deleteTransactionApi(
        id
      );

    } catch (error) {

      console.log(
        'Delete transaction backend error:',
        error
      );

    }

  };


  // =================================================
  // CLEAR ALL TRANSACTIONS
  // =================================================

  const clearAllTransactions =
    async () => {

      setTransactions([]);

      await AsyncStorage.removeItem(
        'transactions'
      );

    };


  // =================================================
  // RESET DATA
  // =================================================

  const resetData = async () => {

    try {

      setTransactions(
        initialTransactions
      );

      await AsyncStorage.setItem(
        'transactions',
        JSON.stringify(
          initialTransactions
        )
      );

    } catch (error) {

      console.log(
        'Reset data error:',
        error
      );

    }

  };


  // =================================================
  // SMART SPEND CALCULATION
  // =================================================

  const today =
    new Date();

  const todayDate =
    today
      .toISOString()
      .split('T')[0];


  // =================================================
  // TODAY EXPENSE
  // =================================================

  const todayExpense =
    transactions
      .filter(
        transaction => {

          const transactionDate =
            String(
              transaction.date || ''
            )
              .split('T')[0];

          return (
            transaction.type === 'expense' &&
            transactionDate === todayDate
          );

        }
      )
      .reduce(
        (
          total,
          transaction
        ) => {

          const amount =
            Number(
              transaction.amount || 0
            );

          return (
            total + amount
          );

        },
        0
      );


  // =================================================
  // PREVIOUS EXPENSE TRANSACTIONS
  // =================================================

  const previousExpenseTransactions =
    transactions.filter(
      transaction => {

        const transactionDate =
          String(
            transaction.date || ''
          )
            .split('T')[0];

        return (
          transaction.type === 'expense' &&
          transactionDate !== todayDate
        );

      }
    );


  // =================================================
  // PREVIOUS TOTAL EXPENSE
  // =================================================

  const previousTotalExpense =
    previousExpenseTransactions.reduce(
      (
        total,
        transaction
      ) => {

        const amount =
          Number(
            transaction.amount || 0
          );

        return (
          total + amount
        );

      },
      0
    );


  // =================================================
  // UNIQUE PREVIOUS EXPENSE DAYS
  // =================================================

  const uniquePreviousExpenseDays =
    new Set(
      previousExpenseTransactions.map(
        transaction =>
          String(
            transaction.date || ''
          )
            .split('T')[0]
      )
    ).size;


  // =================================================
  // AVERAGE DAILY EXPENSE
  // =================================================

  const averageDailyExpense =
    uniquePreviousExpenseDays > 0
      ? previousTotalExpense /
        uniquePreviousExpenseDays
      : 0;


  // =================================================
  // SPENDING PERCENTAGE
  // =================================================

  const spendingPercentage =
    averageDailyExpense > 0
      ? (
          todayExpense /
          averageDailyExpense
        ) * 100
      : 0;


  // =================================================
  // HIGH SPENDING
  // =================================================

  const isHighSpending =
    averageDailyExpense > 0 &&
    spendingPercentage > 100;


  // =================================================
  // MONTHLY SPENDING LIMIT
  // =================================================

  const monthlyBudget =
    20000;

  const currentMonth =
    today.getMonth();

  const currentYear =
    today.getFullYear();


  const monthlySpent =
    transactions
      .filter(
        transaction => {

          if (
            transaction.type !==
            'expense'
          ) {

            return false;

          }


          const transactionDate =
            new Date(
              String(
                transaction.date || ''
              )
            );


          if (
            Number.isNaN(
              transactionDate.getTime()
            )
          ) {

            return false;

          }


          return (
            transactionDate.getMonth() ===
              currentMonth &&
            transactionDate.getFullYear() ===
              currentYear
          );

        }
      )
      .reduce(
        (
          total,
          transaction
        ) => {

          return (
            total +
            Number(
              transaction.amount || 0
            )
          );

        },
        0
      );


  const monthlyRemaining =
    Math.max(
      monthlyBudget -
      monthlySpent,
      0
    );


  const monthlyPercentage =
    monthlyBudget > 0
      ? (
          monthlySpent /
          monthlyBudget
        ) * 100
      : 0;


  const isMonthlyBudgetExceeded =
    monthlySpent >=
    monthlyBudget;


  const isMonthlyBudgetDanger =
    monthlyPercentage >= 90;


  const isMonthlyBudgetWarning =
    monthlyPercentage >= 75 &&
    monthlyPercentage < 90;


  // =================================================
  // NOTE FUNCTIONS
  // =================================================

  const addNote = (
    note: Note
  ) => {

    setNotes(
      previous => [
        note,
        ...previous,
      ]
    );

  };


  const updateNote = (
    note: Note
  ) => {

    setNotes(
      previous =>
        previous.map(
          item =>
            item.id === note.id
              ? note
              : item
        )
    );

  };


  const deleteNote = (
    id: string
  ) => {

    setNotes(
      previous =>
        previous.filter(
          item =>
            item.id !== id
        )
    );

  };


  const togglePinNote = (
    id: string
  ) => {

    setNotes(
      previous =>
        previous.map(
          item =>
            item.id === id
              ? {
                  ...item,
                  pinned:
                    !item.pinned,
                }
              : item
        )
    );

  };


  // =================================================
  // TASK FUNCTIONS
  // =================================================

  const addTask = (
    task: Task
  ) => {

    setTasks(
      previous => [
        task,
        ...previous,
      ]
    );

  };


  const updateTask = (
    task: Task
  ) => {

    setTasks(
      previous =>
        previous.map(
          item =>
            item.id === task.id
              ? task
              : item
        )
    );

  };


  const deleteTask = (
    id: string
  ) => {

    setTasks(
      previous =>
        previous.filter(
          item =>
            item.id !== id
        )
    );

  };


  const toggleTask = (
    id: string
  ) => {

    setTasks(
      previous =>
        previous.map(
          item =>
            item.id === id
              ? {
                  ...item,
                  completed:
                    !item.completed,
                }
              : item
        )
    );

  };


  // =================================================
  // EVENT FUNCTIONS
  // =================================================

  const addEvent = (
    event: EventItem
  ) => {

    setEvents(
      previous => [
        event,
        ...previous,
      ]
    );

  };


  const updateEvent = (
    event: EventItem
  ) => {

    setEvents(
      previous =>
        previous.map(
          item =>
            item.id === event.id
              ? event
              : item
        )
    );

  };


  const deleteEvent = (
    id: string
  ) => {

    setEvents(
      previous =>
        previous.filter(
          item =>
            item.id !== id
        )
    );

  };


  // =================================================
  // REMINDER FUNCTIONS
  // =================================================

  const addReminder = (
    reminder: Reminder
  ) => {

    setReminders(
      previous => [
        reminder,
        ...previous,
      ]
    );

  };


  const updateReminder = (
    reminder: Reminder
  ) => {

    setReminders(
      previous =>
        previous.map(
          item =>
            item.id === reminder.id
              ? reminder
              : item
        )
    );

  };


  const deleteReminder = (
    id: string
  ) => {

    setReminders(
      previous =>
        previous.filter(
          item =>
            item.id !== id
        )
    );

  };


  const completeReminder = (
    id: string
  ) => {

    setReminders(
      previous =>
        previous.map(
          item =>
            item.id === id
              ? {
                  ...item,
                  status:
                    'Completed',
                  completedAt:
                    new Date()
                      .toISOString(),
                }
              : item
        )
    );

  };


  const snoozeReminder = (
    id: string,
    minutes: number
  ) => {

    const newDate =
      new Date(
        Date.now() +
        minutes *
        60 *
        1000
      );

    const date =
      newDate
        .toISOString()
        .split('T')[0];

    const time =
      newDate.toLocaleTimeString(
        'en-IN',
        {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }
      );


    setReminders(
      previous =>
        previous.map(
          item =>
            item.id === id
              ? {
                  ...item,
                  date,
                  time,
                  status:
                    'Snoozed',
                }
              : item
        )
    );

  };


  const rescheduleReminder = (
    id: string,
    date: string,
    time: string
  ) => {

    setReminders(
      previous =>
        previous.map(
          item =>
            item.id === id
              ? {
                  ...item,
                  date,
                  time,
                  status:
                    'Rescheduled',
                }
              : item
        )
    );

  };


  // =================================================
  // RECURRING EXPENSE FUNCTIONS
  // =================================================

  const addRecurringExpense = (
    expense: Omit<
      RecurringExpense,
      'id'
    >
  ) => {

    const newExpense:
      RecurringExpense = {

      ...expense,

      id:
        Date.now().toString(),

    };


    setRecurringExpenses(
      previous => [
        newExpense,
        ...previous,
      ]
    );

  };


  const deleteRecurringExpense = (
    id: string
  ) => {

    setRecurringExpenses(
      previous =>
        previous.filter(
          item =>
            item.id !== id
        )
    );

  };


  const toggleRecurringExpense = (
    id: string
  ) => {

    setRecurringExpenses(
      previous =>
        previous.map(
          item =>
            item.id === id
              ? {
                  ...item,
                  active:
                    !item.active,
                }
              : item
        )
    );

  };


  // =================================================
  // PROVIDER
  // =================================================

  return (

    <ExpenseContext.Provider
      value={{

        // TRANSACTIONS
        transactions,

        addTransaction,

        deleteTransaction,

        clearAllTransactions,

        resetData,

        // SMART SPEND
        todayExpense,

        averageDailyExpense,

        spendingPercentage,

        isHighSpending,

        // MONTHLY
        monthlyBudget,

        monthlySpent,

        monthlyRemaining,

        monthlyPercentage,

        isMonthlyBudgetExceeded,

        isMonthlyBudgetDanger,

        isMonthlyBudgetWarning,

        // NOTES
        notes,

        addNote,

        updateNote,

        deleteNote,

        togglePinNote,

        // TASKS
        tasks,

        addTask,

        updateTask,

        deleteTask,

        toggleTask,

        // EVENTS
        events,

        addEvent,

        updateEvent,

        deleteEvent,

        // REMINDERS
        reminders,

        addReminder,

        updateReminder,

        deleteReminder,

        completeReminder,

        snoozeReminder,

        rescheduleReminder,

        // RECURRING
        recurringExpenses,

        addRecurringExpense,

        deleteRecurringExpense,

        toggleRecurringExpense,

      }}
    >

      {children}

    </ExpenseContext.Provider>

  );

}


// ==================================================
// USE EXPENSE HOOK
// ==================================================

export function useExpense() {

  const context =
    useContext(
      ExpenseContext
    );


  if (!context) {

    throw new Error(
      'useExpense must be used inside ExpenseProvider'
    );

  }


  return context;

}