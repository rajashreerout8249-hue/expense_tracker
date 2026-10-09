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
import { EventItem } from '../src/types';
import { cancelNotification, scheduleAndSaveNotification } from '../src/services/notificationService';

export default function EventsScreen() {

  const {
    events,
    addEvent,
    updateEvent,
    deleteEvent
  } = useExpense();

  const [showForm, setShowForm] =
    useState(false);

  const [editingEvent, setEditingEvent] =
    useState<EventItem | null>(null);

  const [title, setTitle] =
    useState('');

  const [description, setDescription] =
    useState('');

  const [date, setDate] =
    useState('');

  const [time, setTime] =
    useState('');

  const [repeat, setRepeat] =
    useState<
      'None' |
      'Daily' |
      'Weekly' |
      'Monthly'
    >('None');

  const [reminder, setReminder] =
    useState(false);

  const [selectedDate, setSelectedDate] =
    useState(new Date());

  const [showDatePicker, setShowDatePicker] =
    useState(false);

  const [showTimePicker, setShowTimePicker] =
    useState(false);


  /* =========================
     DATE FORMAT
  ========================= */

  const formatDate = (
    value: Date
  ) => {

    const year =
      value.getFullYear();

    const month =
      String(
        value.getMonth() + 1
      ).padStart(2, '0');

    const day =
      String(
        value.getDate()
      ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };


  /* =========================
     TIME FORMAT
  ========================= */

  const formatTime = (
    value: Date
  ) => {

    let hours =
      value.getHours();

    const minutes =
      String(
        value.getMinutes()
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


  /* =========================
     DATE CHANGE
  ========================= */

  const onDateChange = (
    event: any,
    selected?: Date
  ) => {

    setShowDatePicker(false);

    if (!selected) {
      return;
    }

    setSelectedDate(selected);

    setDate(
      formatDate(selected)
    );
  };


  /* =========================
     TIME CHANGE
  ========================= */

  const onTimeChange = (
    event: any,
    selected?: Date
  ) => {

    setShowTimePicker(false);

    if (!selected) {
      return;
    }

    setTime(
      formatTime(selected)
    );
  };


  /* =========================
     OPEN ADD
  ========================= */

  const openAdd = () => {

    setEditingEvent(null);

    setTitle('');
    setDescription('');
    setDate('');
    setTime('');
    setRepeat('None');
    setReminder(false);

    setSelectedDate(
      new Date()
    );

    setShowForm(true);
  };


  /* =========================
     OPEN EDIT
  ========================= */

  const openEdit = (
    event: EventItem
  ) => {

    setEditingEvent(event);

    setTitle(event.title);

    setDescription(
      event.description
    );

    setDate(event.date);

    setTime(event.time);

    setRepeat(event.repeat);

    setReminder(
      event.reminder
    );

    const parsedDate =
      new Date(
        `${event.date}T12:00:00`
      );

    if (
      !isNaN(
        parsedDate.getTime()
      )
    ) {
      setSelectedDate(
        parsedDate
      );
    }

    setShowForm(true);
  };


  /* =========================
     PARSE DATE + TIME
  ========================= */

  const getEventDateTime = () => {

    if (
      !date ||
      !time
    ) {
      return null;
    }

    const parts =
      time.trim().split(' ');

    const timePart =
      parts[0];

    const ampm =
      parts[1];

    const timeParts =
      timePart.split(':');

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

    const result =
      new Date(
        `${date}T00:00:00`
      );

    result.setHours(
      hours,
      minutes,
      0,
      0
    );

    return result;
  };

  /* =========================
     SAVE EVENT
  ========================= */

  const saveEvent = async () => {

    if (!title.trim()) {

      Alert.alert(
        'Title Required',
        'Please enter event title.'
      );

      return;
    }

    if (!date) {

      Alert.alert(
        'Date Required',
        'Please select event date.'
      );

      return;
    }

    if (!time) {

      Alert.alert(
        'Time Required',
        'Please select event time.'
      );

      return;
    }

    const eventDate =
      getEventDateTime();

    if (!eventDate) {
      return;
    }

    if (
      reminder &&
      eventDate.getTime() <=
        Date.now()
    ) {

      Alert.alert(
        'Invalid Reminder',
        'Reminder date and time must be in the future.'
      );

      return;
    }


    if (editingEvent?.notificationId) {
      await cancelNotification(editingEvent.notificationId);
    }

    let notificationId = editingEvent?.notificationId;

    if (reminder) {
      notificationId = await scheduleAndSaveNotification({
        title: title.trim(),
        body: description.trim() || 'You have an upcoming event.',
        date: eventDate,
        repeat,
        type: 'Event',
        sourceId: editingEvent?.id || '',
      }) || undefined;
    } else {
      notificationId = undefined;
    }

    const newEvent: EventItem = {

      id:
        editingEvent?.id ||
        Date.now().toString(),

      title:
        title.trim(),

      description:
        description.trim(),

      date,

      time,

      repeat,

      reminder,
      notificationId,
createdAt:
        editingEvent?.createdAt ||
        new Date().toISOString()
    };


    if (editingEvent) {

      updateEvent(
        newEvent
      );

    } else {

      addEvent(
        newEvent
      );

    }


    setShowForm(false);

    setEditingEvent(null);

    setTitle('');
    setDescription('');
    setDate('');
    setTime('');
    setRepeat('None');
    setReminder(false);
  };


  /* =========================
     DELETE EVENT
  ========================= */

  const handleDelete = (
    event: EventItem
  ) => {

    Alert.alert(
      'Delete Event',
      `Delete "${event.title}"?`,

      [
        {
          text: 'Cancel',
          style: 'cancel'
        },

        {
          text: 'Delete',
          style: 'destructive',

          onPress: async () => {
            await cancelNotification(event.notificationId);
            deleteEvent(
              event.id
            );

          }
        }
      ]
    );
  };


  /* =========================
     SORT EVENTS
  ========================= */

  const sortedEvents =
    [...events].sort(
      (a, b) =>
        `${a.date} ${a.time}`.localeCompare(
          `${b.date} ${b.time}`
        )
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
            Events & Reminders
          </Text>

          <Text style={styles.headerSubtitle}>
            Manage your upcoming events
          </Text>

        </View>


        <TouchableOpacity
          style={styles.addButton}
          onPress={openAdd}
        >

          <Ionicons
            name="add"
            size={27}
            color={colors.background}
          />

        </TouchableOpacity>

      </View>


      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
      >

        {/* SUMMARY */}

        <View style={styles.summaryCard}>

          <View style={styles.summaryIcon}>

            <Ionicons
              name="calendar"
              size={25}
              color={colors.green}
            />

          </View>

          <View>

            <Text style={styles.summaryNumber}>
              {events.length}
            </Text>

            <Text style={styles.summaryLabel}>
              Upcoming Events
            </Text>

          </View>

        </View>


        {/* FORM */}

        {showForm && (

          <View style={styles.formCard}>

            <View style={styles.formHeader}>

              <Text style={styles.formTitle}>
                {editingEvent
                  ? 'Edit Event'
                  : 'Add New Event'}
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


            {/* TITLE */}

            <Text style={styles.label}>
              Event Title
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter event title"
              placeholderTextColor={
                colors.muted
              }
              value={title}
              onChangeText={setTitle}
            />


            {/* DESCRIPTION */}

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


            {/* DATE */}

            <Text style={styles.label}>
              Event Date
            </Text>

            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() =>
                setShowDatePicker(true)
              }
            >

              <Ionicons
                name="calendar-outline"
                size={21}
                color={colors.green}
              />

              <Text
                style={
                  date
                    ? styles.pickerText
                    : styles.placeholderText
                }
              >
                {date ||
                  'Select event date'}
              </Text>

            </TouchableOpacity>


            {showDatePicker && (

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
              Event Time
            </Text>

            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() =>
                setShowTimePicker(true)
              }
            >

              <Ionicons
                name="time-outline"
                size={21}
                color={colors.green}
              />

              <Text
                style={
                  time
                    ? styles.pickerText
                    : styles.placeholderText
                }
              >
                {time ||
                  'Select event time'}
              </Text>

            </TouchableOpacity>


            {showTimePicker && (

              <DateTimePicker
                value={
                  selectedDate
                }
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


            {/* REPEAT */}

            <Text style={styles.label}>
              Repeat
            </Text>

            <View style={styles.repeatRow}>

              {(
                [
                  'None',
                  'Daily',
                  'Weekly',
                  'Monthly'
                ] as const
              ).map(item => (

                <TouchableOpacity
                  key={item}
                  style={[
                    styles.repeatButton,
                    repeat === item &&
                      styles.repeatActive
                  ]}
                  onPress={() =>
                    setRepeat(item)
                  }
                >

                  <Text
                    style={[
                      styles.repeatText,
                      repeat === item &&
                        styles.repeatTextActive
                    ]}
                  >
                    {item}
                  </Text>

                </TouchableOpacity>

              ))}

            </View>


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
                    Notify me at event time
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
              onPress={saveEvent}
            >

              <Ionicons
                name={
                  editingEvent
                    ? 'checkmark'
                    : 'add'
                }
                size={21}
                color={
                  colors.background
                }
              />

              <Text style={styles.saveText}>
                {editingEvent
                  ? 'Update Event'
                  : 'Save Event'}
              </Text>

            </TouchableOpacity>

          </View>

        )}


        {/* EVENT LIST */}

        <View style={styles.sectionHeader}>

          <Text style={styles.sectionTitle}>
            Upcoming Events
          </Text>

          <Text style={styles.count}>
            {events.length}
          </Text>

        </View>


        {sortedEvents.length === 0 ? (

          <View style={styles.emptyCard}>

            <Ionicons
              name="calendar-outline"
              size={46}
              color={colors.green}
            />

            <Text style={styles.emptyTitle}>
              No Events Yet
            </Text>

            <Text style={styles.emptyText}>
              Add your first event or reminder.
            </Text>

            <TouchableOpacity
              style={styles.emptyButton}
              onPress={openAdd}
            >

              <Ionicons
                name="add"
                size={19}
                color={colors.background}
              />

              <Text style={styles.emptyButtonText}>
                Add Event
              </Text>

            </TouchableOpacity>

          </View>

        ) : (

          sortedEvents.map(event => (

            <EventCard
              key={event.id}
              event={event}
              onEdit={() =>
                openEdit(event)
              }
              onDelete={() =>
                handleDelete(event)
              }
            />

          ))

        )}

      </ScrollView>

    </View>
  );
}


/* =====================================================
   EVENT CARD
===================================================== */

function EventCard({
  event,
  onEdit,
  onDelete
}: {
  event: EventItem;
  onEdit: () => void;
  onDelete: () => void;
}) {

  return (

    <View style={styles.eventCard}>

      <View style={styles.eventDateBox}>

        <Ionicons
          name="calendar"
          size={21}
          color={colors.green}
        />

        <Text style={styles.eventDate}>
          {event.date}
        </Text>

      </View>


      <View style={styles.eventContent}>

        <View style={styles.eventTop}>

          <Text style={styles.eventTitle}>
            {event.title}
          </Text>

          {event.reminder && (

            <Ionicons
              name="notifications"
              size={17}
              color={colors.green}
            />

          )}

        </View>


        {event.description ? (

          <Text
            style={styles.eventDescription}
            numberOfLines={2}
          >
            {event.description}
          </Text>

        ) : null}


        <View style={styles.eventMeta}>

          <View style={styles.metaItem}>

            <Ionicons
              name="time-outline"
              size={15}
              color={colors.muted}
            />

            <Text style={styles.metaText}>
              {event.time}
            </Text>

          </View>


          <View style={styles.metaItem}>

            <Ionicons
              name="repeat-outline"
              size={15}
              color={colors.muted}
            />

            <Text style={styles.metaText}>
              {event.repeat}
            </Text>

          </View>

        </View>


        <View style={styles.actionRow}>

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
    backgroundColor:
      colors.surface2,
    alignItems: 'center',
    justifyContent: 'center'
  },

  headerCenter: {
    flex: 1,
    marginLeft: 12
  },

  headerTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800'
  },

  headerSubtitle: {
    color: colors.muted,
    fontSize: 11,
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

  summaryCard: {
    backgroundColor:
      colors.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor:
      colors.border,
    marginBottom: 18
  },

  summaryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor:
      'rgba(16,185,129,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13
  },

  summaryNumber: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800'
  },

  summaryLabel: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2
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
    marginBottom: 12
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
    marginTop: 12,
    marginBottom: 8
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
    height: 85,
    paddingTop: 12,
    textAlignVertical: 'top'
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

  repeatRow: {
    flexDirection: 'row'
  },

  repeatButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    borderWidth: 1,
    borderColor:
      colors.border,
    backgroundColor:
      colors.surface,
    alignItems: 'center',
    marginRight: 5
  },

  repeatActive: {
    backgroundColor:
      colors.green,
    borderColor:
      colors.green
  },

  repeatText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700'
  },

  repeatTextActive: {
    color: colors.background
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
    marginBottom: 12
  },

  sectionTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 17,
    fontWeight: '800'
  },

  count: {
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

  eventCard: {
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

  eventDateBox: {
    width: 78,
    minHeight: 72,
    borderRadius: 12,
    backgroundColor:
      colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },

  eventDate: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 6,
    textAlign: 'center'
  },

  eventContent: {
    flex: 1
  },

  eventTop: {
    flexDirection: 'row',
    alignItems: 'center'
  },

  eventTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    marginRight: 8
  },

  eventDescription: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6
  },

  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 9
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15
  },

  metaText: {
    color: colors.muted,
    fontSize: 11,
    marginLeft: 5
  },

  actionRow: {
    flexDirection: 'row',
    marginTop: 11,
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
    borderRadius: 17,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor:
      colors.border
  },

  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 10
  },

  emptyText: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center'
  },

  emptyButton: {
    marginTop: 18,
    paddingHorizontal: 18,
    height: 42,
    borderRadius: 21,
    backgroundColor:
      colors.green,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },

  emptyButtonText: {
    color: colors.background,
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 5
  }

});