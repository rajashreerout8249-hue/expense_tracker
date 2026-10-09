import React, { useState } from 'react';

import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useExpense } from '../src/context/ExpenseContext';
import { colors } from '../src/theme';
import { Task } from '../src/types';
import { cancelNotification, scheduleAndSaveNotification } from '../src/services/notificationService';


export default function TasksScreen() {
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTask
  } = useExpense();

  const [editingTask, setEditingTask] =
    useState<Task | null>(null);

  const [showForm, setShowForm] =
    useState(false);

  const [title, setTitle] =
    useState('');

  const [description, setDescription] =
    useState('');

  const [priority, setPriority] =
    useState<'Low' | 'Medium' | 'High'>(
      'Medium'
    );

  const [dueDate, setDueDate] =
    useState('');

  const [dueTime, setDueTime] =
    useState('');

  const [reminder, setReminder] =
    useState(false);

  const [datePicker, setDatePicker] =
    useState(false);

  const [timePicker, setTimePicker] =
    useState(false);

  const [selectedDate, setSelectedDate] =
    useState(new Date());

  const [selectedTime, setSelectedTime] =
    useState(new Date());

  const formatDate = (date: Date) => {
    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, '0');

    const day =
      String(
        date.getDate()
      ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const formatTime = (date: Date) => {
    let hours =
      date.getHours();

    const minutes =
      String(
        date.getMinutes()
      ).padStart(2, '0');

    const ampm =
      hours >= 12
        ? 'PM'
        : 'AM';

    hours =
      hours % 12;

    hours =
      hours || 12;

    return `${hours}:${minutes} ${ampm}`;
  };

  const openAddForm = () => {
    setEditingTask(null);

    setTitle('');
    setDescription('');
    setPriority('Medium');
    setDueDate('');
    setDueTime('');
    setReminder(false);

    const now = new Date();

    setSelectedDate(now);
    setSelectedTime(now);

    setShowForm(true);
  };

  const openEditForm = (
    task: Task
  ) => {
    setEditingTask(task);

    setTitle(task.title);
    setDescription(
      task.description
    );
    setPriority(task.priority);
    setDueDate(task.dueDate);
    setDueTime(task.dueTime);
    setReminder(false);

    const date = new Date(
      `${task.dueDate}T12:00:00`
    );

    if (!isNaN(date.getTime())) {
      setSelectedDate(date);
    }

    const parsedTime = new Date();
    const timeMatch = String(task.dueTime || '')
      .trim()
      .match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

    if (timeMatch) {
      let hours = Number(timeMatch[1]);
      const minutes = Number(timeMatch[2]);
      const ampm = timeMatch[3].toUpperCase();

      if (ampm === 'PM' && hours !== 12) {
        hours += 12;
      }

      if (ampm === 'AM' && hours === 12) {
        hours = 0;
      }

      parsedTime.setHours(hours, minutes, 0, 0);
    }

    setSelectedTime(parsedTime);
    setShowForm(true);
  };

  const onDateChange = (
    event: any,
    date?: Date
  ) => {
    setDatePicker(false);

    if (!date) {
      return;
    }

    setSelectedDate(date);
    setDueDate(
      formatDate(date)
    );
  };

  const onTimeChange = (
    event: any,
    date?: Date
  ) => {
    setTimePicker(false);

    if (!date) {
      return;
    }

    setSelectedTime(date);
    setDueTime(formatTime(date));
  };

  const getReminderDate = () => {
    if (
      !dueDate ||
      !dueTime
    ) {
      return null;
    }

    const parts =
      dueTime
        .trim()
        .split(' ');

    const time =
      parts[0];

    const ampm =
      parts[1];

    const timeParts =
      time.split(':');

    let hours =
      Number(
        timeParts[0]
      );

    const minutes =
      Number(
        timeParts[1]
      );

    if (
      ampm === 'PM' &&
      hours !== 12
    ) {
      hours += 12;
    }

    if (
      ampm === 'AM' &&
      hours === 12
    ) {
      hours = 0;
    }

    const date =
      new Date(
        `${dueDate}T00:00:00`
      );

    date.setHours(
      hours,
      minutes,
      0,
      0
    );

    return date;
  };
const saveTask = async () => {
    if (!title.trim()) {
      Alert.alert(
        'Task Required',
        'Please enter task title.'
      );

      return;
    }

    if (!dueDate) {
      Alert.alert(
        'Date Required',
        'Please select due date.'
      );

      return;
    }

    if (!dueTime) {
      Alert.alert(
        'Time Required',
        'Please select due time.'
      );

      return;
    }

    const reminderDate =
      getReminderDate();

    if (
      reminder &&
      !reminderDate
    ) {
      Alert.alert(
        'Reminder Error',
        'Please select valid date and time.'
      );

      return;
    }

    if (
      reminder &&
      reminderDate &&
      reminderDate.getTime() <=
        Date.now()
    ) {
      Alert.alert(
        'Invalid Reminder',
        'Reminder date and time must be in the future.'
      );

      return;
    }

    if (editingTask?.notificationId) {
      await cancelNotification(editingTask.notificationId);
    }

    let notificationId = editingTask?.notificationId;

    if (reminder) {
      notificationId = await scheduleAndSaveNotification({
        title: title.trim(),
        body: description.trim() || 'You have a task reminder.',
        date: reminderDate!,
        type: 'Task',
        sourceId: editingTask?.id || '',
      }) || undefined;
    } else {
      notificationId = undefined;
    }

    const task: Task = {
      id: editingTask?.id || Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate,
      dueTime,
      completed: editingTask?.completed || false,
      createdAt: editingTask?.createdAt || new Date().toISOString(),
      notificationId,
      reminderMinutes: 0,
      emailReminder: false,
    };

    if (editingTask) {
      updateTask(task);
    } else {
      addTask(task);
    }

    setShowForm(false);
    setEditingTask(null);

    setTitle('');
    setDescription('');
    setPriority('Medium');
    setDueDate('');
    setDueTime('');
    setReminder(false);
    setSelectedDate(new Date());
    setSelectedTime(new Date());
  };

  const handleDelete = (
    task: Task
  ) => {
    Alert.alert(
      'Delete Task',
      `Delete "${task.title}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteTask(
              task.id
            );
          }
        }
      ]
    );
  };

  const handleToggle = (
    task: Task
  ) => {
    if (
      !task.completed
    ) {
updateTask({
        ...task,
        completed: true
      });

      return;
    }

    updateTask({
      ...task,
      completed: false
    });
  };

  const pendingTasks =
    tasks.filter(
      task =>
        !task.completed
    );

  const completedTasks =
    tasks.filter(
      task =>
        task.completed
    );

  return (
    <View style={styles.container}>

      {/* HEADER */}

      <View style={styles.header}>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            router.back()
          }
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={colors.text}
          />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            Tasks
          </Text>

          <Text style={styles.headerSubtitle}>
            Manage your daily tasks
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={openAddForm}
        >
          <Ionicons
            name="add"
            size={27}
            color={colors.background}
          />
        </TouchableOpacity>

      </View>

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={false}
      >

        {/* SUMMARY */}

        <View style={styles.summaryRow}>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>
              {pendingTasks.length}
            </Text>

            <Text style={styles.summaryLabel}>
              Pending
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>
              {completedTasks.length}
            </Text>

            <Text style={styles.summaryLabel}>
              Completed
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>
              {tasks.length}
            </Text>

            <Text style={styles.summaryLabel}>
              Total
            </Text>
          </View>

        </View>

        {/* ADD / EDIT FORM */}

        {showForm && (
          <View style={styles.formCard}>

            <View style={styles.formHeader}>

              <Text style={styles.formTitle}>
                {editingTask
                  ? 'Edit Task'
                  : 'Add New Task'}
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setShowForm(false)
                }
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={colors.muted}
                />
              </TouchableOpacity>

            </View>

            <Text style={styles.label}>
              Task Title
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter task title"
              placeholderTextColor={
                colors.muted
              }
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>
              Description
            </Text>

            <TextInput
              style={[
                styles.input,
                styles.textArea
              ]}
              placeholder="Enter description"
              placeholderTextColor={
                colors.muted
              }
              multiline
              value={description}
              onChangeText={
                setDescription
              }
            />

            {/* PRIORITY */}

            <Text style={styles.label}>
              Priority
            </Text>

            <View style={styles.priorityRow}>

              {(
                [
                  'Low',
                  'Medium',
                  'High'
                ] as const
              ).map(item => (

                <TouchableOpacity
                  key={item}
                  style={[
                    styles.priorityButton,
                    priority === item &&
                      styles.priorityActive
                  ]}
                  onPress={() =>
                    setPriority(item)
                  }
                >
                  <Text
                    style={[
                      styles.priorityText,
                      priority === item &&
                        styles.priorityTextActive
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>

              ))}

            </View>

            {/* DATE */}

            <Text style={styles.label}>
              Due Date
            </Text>

            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() =>
                setDatePicker(true)
              }
            >

              <Ionicons
                name="calendar-outline"
                size={21}
                color={colors.green}
              />

              <Text
                style={
                  dueDate
                    ? styles.pickerText
                    : styles.placeholderText
                }
              >
                {dueDate ||
                  'Select due date'}
              </Text>

            </TouchableOpacity>

            {datePicker && (
              <DateTimePicker
                value={
                  selectedDate
                }
                mode="date"
                display={
                  Platform.OS === 'ios'
                    ? 'spinner'
                    : 'default'
                }
                onChange={
                  onDateChange
                }
              />
            )}

            {/* TIME */}

            <Text style={styles.label}>
              Due Time
            </Text>

            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() =>
                setTimePicker(true)
              }
            >

              <Ionicons
                name="time-outline"
                size={21}
                color={colors.green}
              />

              <Text
                style={
                  dueTime
                    ? styles.pickerText
                    : styles.placeholderText
                }
              >
                {dueTime ||
                  'Select due time'}
              </Text>

            </TouchableOpacity>

            {timePicker && (
              <DateTimePicker
                value={selectedTime}
                mode="time"
                display={
                  Platform.OS === 'ios'
                    ? 'spinner'
                    : 'default'
                }
                onChange={
                  onTimeChange
                }
              />
            )}

            {/* REMINDER */}

            <View style={styles.reminderRow}>

              <View style={styles.reminderLeft}>

                <View style={styles.reminderIcon}>
                  <Ionicons
                    name="notifications-outline"
                    size={21}
                    color={colors.green}
                  />
                </View>

                <View>
                  <Text style={styles.reminderTitle}>
                    Reminder
                  </Text>

                  <Text
                    style={
                      styles.reminderSubtitle
                    }
                  >
                    Notify me at due time
                  </Text>
                </View>

              </View>

              <Switch
                value={reminder}
                onValueChange={
                  setReminder
                }
                trackColor={{
                  false:
                    colors.border,
                  true:
                    colors.green
                }}
                thumbColor={
                  colors.white
                }
              />

            </View>

            {/* SAVE */}

            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveTask}
              activeOpacity={0.8}
            >
              <Ionicons
                name={
                  editingTask
                    ? 'checkmark'
                    : 'add'
                }
                size={21}
                color={
                  colors.background
                }
              />

              <Text style={styles.saveText}>
                {editingTask
                  ? 'Update Task'
                  : 'Save Task'}
              </Text>
            </TouchableOpacity>

          </View>
        )}

        {/* PENDING */}

        <View style={styles.sectionHeader}>

          <Text style={styles.sectionTitle}>
            Pending Tasks
          </Text>

          <Text style={styles.countText}>
            {pendingTasks.length}
          </Text>

        </View>

        {pendingTasks.length === 0 ? (

          <View style={styles.emptyCard}>

            <Ionicons
              name="checkmark-circle-outline"
              size={42}
              color={colors.green}
            />

            <Text style={styles.emptyTitle}>
              No pending tasks
            </Text>

            <Text style={styles.emptyText}>
              You are all caught up!
            </Text>

          </View>

        ) : (

          pendingTasks.map(task => (

            <TaskCard
              key={task.id}
              task={task}
              onToggle={() =>
                handleToggle(task)
              }
              onEdit={() =>
                openEditForm(task)
              }
              onDelete={() =>
                handleDelete(task)
              }
            />

          ))

        )}

        {/* COMPLETED */}

        <View style={styles.sectionHeader}>

          <Text style={styles.sectionTitle}>
            Completed
          </Text>

          <Text style={styles.countText}>
            {completedTasks.length}
          </Text>

        </View>

        {completedTasks.length === 0 ? (

          <View style={styles.emptySmall}>
            <Text style={styles.emptyText}>
              No completed tasks yet.
            </Text>
          </View>

        ) : (

          completedTasks.map(task => (

            <TaskCard
              key={task.id}
              task={task}
              onToggle={() =>
                handleToggle(task)
              }
              onEdit={() =>
                openEditForm(task)
              }
              onDelete={() =>
                handleDelete(task)
              }
            />

          ))

        )}

      </ScrollView>

    </View>
  );
}

/* =====================================================
   TASK CARD
===================================================== */

function TaskCard({
  task,
  onToggle,
  onEdit,
  onDelete
}: {
  task: Task;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <View
      style={[
        styles.taskCard,
        task.completed &&
          styles.completedCard
      ]}
    >

      <TouchableOpacity
        style={styles.checkButton}
        onPress={onToggle}
      >
        <Ionicons
          name={
            task.completed
              ? 'checkmark-circle'
              : 'ellipse-outline'
          }
          size={28}
          color={
            task.completed
              ? colors.green
              : colors.muted
          }
        />
      </TouchableOpacity>

      <View style={styles.taskContent}>

        <View style={styles.taskTop}>

          <Text
            style={[
              styles.taskTitle,
              task.completed &&
                styles.completedText
            ]}
          >
            {task.title}
          </Text>

          <View
            style={[
              styles.priorityBadge,
              task.priority === 'High' &&
                styles.highBadge,
              task.priority === 'Medium' &&
                styles.mediumBadge,
              task.priority === 'Low' &&
                styles.lowBadge
            ]}
          >
            <Text
              style={styles.priorityBadgeText}
            >
              {task.priority}
            </Text>
          </View>

        </View>

        {task.description ? (
          <Text
            style={[
              styles.taskDescription,
              task.completed &&
                styles.completedText
            ]}
            numberOfLines={2}
          >
            {task.description}
          </Text>
        ) : null}

        <View style={styles.taskMeta}>

          <View style={styles.metaItem}>

            <Ionicons
              name="calendar-outline"
              size={15}
              color={colors.muted}
            />

            <Text style={styles.metaText}>
              {task.dueDate}
            </Text>

          </View>

          <View style={styles.metaItem}>

            <Ionicons
              name="time-outline"
              size={15}
              color={colors.muted}
            />

            <Text style={styles.metaText}>
              {task.dueTime}
            </Text>

          </View>



        </View>

        <View style={styles.actions}>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={onEdit}
          >
            <Ionicons
              name="create-outline"
              size={18}
              color={colors.muted}
            />

            <Text style={styles.actionText}>
              Edit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={onDelete}
          >
            <Ionicons
              name="trash-outline"
              size={18}
              color={colors.danger}
            />

            <Text
              style={[
                styles.actionText,
                {
                  color:
                    colors.danger
                }
              ]}
            >
              Delete
            </Text>
          </TouchableOpacity>

        </View>

      </View>

    </View>
  );
}

/* =====================================================
   STYLES
===================================================== */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor:
      colors.background
  },

  header: {
    height: 76,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor:
      colors.border
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      colors.surface2
  },

  headerCenter: {
    flex: 1,
    marginLeft: 12
  },

  headerTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '800'
  },

  headerSubtitle: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2
  },

  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor:
      colors.green,
    alignItems: 'center',
    justifyContent: 'center'
  },

  content: {
    padding: 18,
    paddingBottom: 40
  },

  summaryRow: {
    flexDirection: 'row',
    marginBottom: 18
  },

  summaryCard: {
    flex: 1,
    backgroundColor:
      colors.card,
    borderRadius: 14,
    paddingVertical: 16,
    marginRight: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor:
      colors.border
  },

  summaryNumber: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800'
  },

  summaryLabel: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 4
  },

  formCard: {
    backgroundColor:
      colors.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: 22,
    borderWidth: 1,
    borderColor:
      colors.border
  },

  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    marginBottom: 16
  },

  formTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800'
  },

  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 12
  },

  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor:
      colors.border,
    backgroundColor:
      colors.surface,
    color: colors.text,
    paddingHorizontal: 14,
    fontSize: 14
  },

  textArea: {
    height: 90,
    paddingTop: 13,
    textAlignVertical: 'top'
  },

  priorityRow: {
    flexDirection: 'row'
  },

  priorityButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor:
      colors.border,
    backgroundColor:
      colors.surface,
    alignItems: 'center',
    marginRight: 7
  },

  priorityActive: {
    backgroundColor:
      colors.green,
    borderColor:
      colors.green
  },

  priorityText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700'
  },

  priorityTextActive: {
    color: colors.background
  },

  pickerButton: {
    minHeight: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor:
      colors.border,
    backgroundColor:
      colors.surface,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center'
  },

  pickerText: {
    color: colors.text,
    fontSize: 14,
    marginLeft: 10
  },

  placeholderText: {
    color: colors.muted,
    fontSize: 14,
    marginLeft: 10
  },

  reminderRow: {
    marginTop: 18,
    padding: 13,
    borderRadius: 13,
    backgroundColor:
      colors.surface2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between'
  },

  reminderLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },

  reminderIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor:
      'rgba(16,185,129,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },

  reminderTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700'
  },

  reminderSubtitle: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2
  },

  saveButton: {
    height: 50,
    borderRadius: 13,
    backgroundColor:
      colors.green,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18
  },

  saveText: {
    color: colors.background,
    fontSize: 15,
    fontWeight: '800',
    marginLeft: 7
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4
  },

  sectionTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 17,
    fontWeight: '800'
  },

  countText: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor:
      colors.surface2,
    color: colors.green,
    textAlign: 'center',
    paddingTop: 5,
    fontSize: 12,
    fontWeight: '800'
  },

  taskCard: {
    backgroundColor:
      colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor:
      colors.border,
    flexDirection: 'row'
  },

  completedCard: {
    opacity: 0.7
  },

  checkButton: {
    width: 34,
    paddingTop: 2
  },

  taskContent: {
    flex: 1
  },

  taskTop: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },

  taskTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    marginRight: 8
  },

  completedText: {
    textDecorationLine:
      'line-through',
    color: colors.muted
  },

  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },

  highBadge: {
    backgroundColor:
      'rgba(239,68,68,0.15)'
  },

  mediumBadge: {
    backgroundColor:
      'rgba(245,158,11,0.15)'
  },

  lowBadge: {
    backgroundColor:
      'rgba(16,185,129,0.15)'
  },

  priorityBadgeText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '800'
  },

  taskDescription: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7
  },

  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 14
  },

  metaText: {
    color: colors.muted,
    fontSize: 11,
    marginLeft: 5
  },

  actions: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor:
      colors.border
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20
  },

  actionText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 5
  },

  emptyCard: {
    backgroundColor:
      colors.card,
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor:
      colors.border,
    marginBottom: 22
  },

  emptySmall: {
    padding: 15,
    marginBottom: 20
  },

  emptyTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 10
  },

  emptyText: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 5
  }

});