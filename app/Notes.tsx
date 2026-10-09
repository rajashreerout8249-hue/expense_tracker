import React, { useMemo, useState } from 'react';

import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useExpense } from '../src/context/ExpenseContext';
import { colors } from '../src/theme';

const categories = [
  'Personal',
  'Work',
  'Important',
  'Ideas',
  'Other'
];

export default function NotesScreen() {

  const {
    notes,
    addNote,
    updateNote,
    deleteNote,
    togglePinNote
  } = useExpense();

  const [search, setSearch] =
    useState('');

  const [showForm, setShowForm] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [title, setTitle] =
    useState('');

  const [description, setDescription] =
    useState('');

  const [category, setCategory] =
    useState('Personal');


  // ===============================
  // SEARCH
  // ===============================

  const filteredNotes = useMemo(() => {

    const query =
      search.trim().toLowerCase();

    const result = notes.filter(note => {

      if (!query) {
        return true;
      }

      return (
        note.title
          .toLowerCase()
          .includes(query) ||

        note.description
          .toLowerCase()
          .includes(query) ||

        note.category
          .toLowerCase()
          .includes(query)
      );
    });

    return [...result].sort(
      (a, b) =>
        Number(b.pinned) -
        Number(a.pinned)
    );

  }, [notes, search]);


  // ===============================
  // OPEN ADD
  // ===============================

  const openAdd = () => {

    setEditingId(null);

    setTitle('');

    setDescription('');

    setCategory('Personal');

    setShowForm(true);
  };


  // ===============================
  // OPEN EDIT
  // ===============================

  const openEdit = (note: any) => {

    setEditingId(note.id);

    setTitle(note.title);

    setDescription(
      note.description
    );

    setCategory(note.category);

    setShowForm(true);
  };


  // ===============================
  // SAVE
  // ===============================

  const saveNote = () => {

    if (!title.trim()) {

      Alert.alert(
        'Title Required',
        'Please enter a note title.'
      );

      return;
    }


    const now =
      new Date().toISOString();


    if (editingId) {

      const oldNote =
        notes.find(
          item =>
            item.id === editingId
        );

      if (!oldNote) return;


      updateNote({
        ...oldNote,

        title: title.trim(),

        description:
          description.trim(),

        category,

        updatedAt: now
      });

    } else {

      addNote({

        id:
          Date.now().toString(),

        title: title.trim(),

        description:
          description.trim(),

        category,

        pinned: false,

        createdAt: now,

        updatedAt: now
      });
    }


    setShowForm(false);

    setEditingId(null);

    setTitle('');

    setDescription('');

    setCategory('Personal');
  };


  // ===============================
  // DELETE
  // ===============================

  const confirmDelete = (
    id: string
  ) => {

    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            deleteNote(id)
        }
      ]
    );
  };


  // ===============================
  // FORMAT DATE
  // ===============================

  const formatDate = (
    dateString: string
  ) => {

    return new Date(
      dateString
    ).toLocaleString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    );
  };


  return (
    <View style={styles.container}>

      {/* HEADER */}

      <View style={styles.header}>

        <TouchableOpacity
          style={styles.back}
          onPress={() =>
            router.back()
          }
        >

          <Ionicons
            name="arrow-back"
            size={23}
            color={colors.text}
          />

        </TouchableOpacity>


        <View style={styles.headerText}>

          <Text style={styles.headerTitle}>
            Quick Notes
          </Text>

          <Text style={styles.headerSub}>
            Save your important information
          </Text>

        </View>


        <TouchableOpacity
          style={styles.addButton}
          onPress={openAdd}
        >

          <Ionicons
            name="add"
            size={25}
            color={colors.background}
          />

        </TouchableOpacity>

      </View>


      {/* SEARCH */}

      <View style={styles.searchBox}>

        <Ionicons
          name="search-outline"
          size={21}
          color={colors.muted}
        />

        <TextInput
          style={styles.searchInput}
          placeholder="Search notes..."
          placeholderTextColor={
            colors.muted
          }
          value={search}
          onChangeText={setSearch}
        />

      </View>


      {/* ADD / EDIT FORM */}

      {showForm && (

        <View style={styles.form}>

          <Text style={styles.formTitle}>
            {editingId
              ? 'Edit Note'
              : 'Create Note'}
          </Text>


          <TextInput
            style={styles.input}
            placeholder="Note title"
            placeholderTextColor={
              colors.muted
            }
            value={title}
            onChangeText={setTitle}
          />


          <TextInput
            style={[
              styles.input,
              styles.description
            ]}
            placeholder="Write your note..."
            placeholderTextColor={
              colors.muted
            }
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
          />


          <Text style={styles.categoryTitle}>
            Category
          </Text>


          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
          >

            {categories.map(item => (

              <TouchableOpacity
                key={item}
                style={[
                  styles.category,
                  category === item &&
                    styles.activeCategory
                ]}
                onPress={() =>
                  setCategory(item)
                }
              >

                <Text
                  style={[
                    styles.categoryText,
                    category === item &&
                      styles.activeCategoryText
                  ]}
                >
                  {item}
                </Text>

              </TouchableOpacity>

            ))}

          </ScrollView>


          <View style={styles.formButtons}>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() =>
                setShowForm(false)
              }
            >

              <Text style={styles.cancelText}>
                Cancel
              </Text>

            </TouchableOpacity>


            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveNote}
            >

              <Text style={styles.saveText}>
                {editingId
                  ? 'Update'
                  : 'Save Note'}
              </Text>

            </TouchableOpacity>

          </View>

        </View>

      )}


      {/* NOTES */}

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.list
        }
      >

        {filteredNotes.length === 0 ? (

          <View style={styles.empty}>

            <View style={styles.emptyIcon}>

              <Ionicons
                name="document-text-outline"
                size={34}
                color="#FBBF24"
              />

            </View>

            <Text style={styles.emptyTitle}>
              No notes found
            </Text>

            <Text style={styles.emptySub}>
              Create your first quick note.
            </Text>

          </View>

        ) : (

          filteredNotes.map(note => (

            <View
              key={note.id}
              style={styles.noteCard}
            >

              {/* NOTE TOP */}

              <View style={styles.noteTop}>

                <View
                  style={[
                    styles.noteIcon,
                    note.pinned &&
                      styles.pinnedIcon
                  ]}
                >

                  <Ionicons
                    name={
                      note.pinned
                        ? 'bookmark'
                        : 'document-text-outline'
                    }
                    size={21}
                    color={
                      note.pinned
                        ? '#FBBF24'
                        : colors.green
                    }
                  />

                </View>


                <View style={styles.noteMain}>

                  <Text
                    style={styles.noteTitle}
                    numberOfLines={1}
                  >
                    {note.title}
                  </Text>

                  <Text style={styles.noteCategory}>
                    {note.category}
                  </Text>

                </View>


                <TouchableOpacity
                  onPress={() =>
                    togglePinNote(
                      note.id
                    )
                  }
                >

                  <Ionicons
                    name={
                      note.pinned
                        ? 'bookmark'
                        : 'bookmark-outline'
                    }
                    size={21}
                    color={
                      note.pinned
                        ? '#FBBF24'
                        : colors.muted
                    }
                  />

                </TouchableOpacity>

              </View>


              {/* DESCRIPTION */}

              {note.description ? (

                <Text
                  style={styles.descriptionText}
                  numberOfLines={3}
                >
                  {note.description}
                </Text>

              ) : null}


              {/* DATE */}

              <View style={styles.noteBottom}>

                <View style={styles.dateRow}>

                  <Ionicons
                    name="time-outline"
                    size={14}
                    color={colors.muted}
                  />

                  <Text style={styles.dateText}>
                    {formatDate(
                      note.updatedAt
                    )}
                  </Text>

                </View>


                <View style={styles.actions}>

                  <TouchableOpacity
                    onPress={() =>
                      openEdit(note)
                    }
                  >

                    <Ionicons
                      name="create-outline"
                      size={20}
                      color="#60A5FA"
                    />

                  </TouchableOpacity>


                  <TouchableOpacity
                    onPress={() =>
                      confirmDelete(
                        note.id
                      )
                    }
                  >

                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color={colors.danger}
                    />

                  </TouchableOpacity>

                </View>

              </View>

            </View>

          ))

        )}

      </ScrollView>

    </View>
  );
}


// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: colors.background
  },

  header: {
    height: 75,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },

  back: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center'
  },

  headerText: {
    flex: 1,
    marginLeft: 12
  },

  headerTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '900'
  },

  headerSub: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 3
  },

  addButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center'
  },

  searchBox: {
    height: 50,
    marginHorizontal: 18,
    marginTop: 15,
    marginBottom: 12,
    paddingHorizontal: 15,
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center'
  },

  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    marginLeft: 10
  },

  form: {
    marginHorizontal: 18,
    marginBottom: 10,
    padding: 17,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border
  },

  formTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 13
  },

  input: {
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: 13,
    fontSize: 14,
    marginBottom: 10
  },

  description: {
    height: 90,
    paddingTop: 13
  },

  categoryTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 9
  },

  category: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 7
  },

  activeCategory: {
    backgroundColor: colors.green,
    borderColor: colors.green
  },

  categoryText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700'
  },

  activeCategoryText: {
    color: colors.background
  },

  formButtons: {
    flexDirection: 'row',
    marginTop: 15
  },

  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7
  },

  cancelText: {
    color: colors.muted,
    fontWeight: '800'
  },

  saveButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 7
  },

  saveText: {
    color: colors.background,
    fontWeight: '900'
  },

  list: {
    paddingHorizontal: 18,
    paddingBottom: 30
  },

  noteCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border
  },

  noteTop: {
    flexDirection: 'row',
    alignItems: 'center'
  },

  noteIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor:
      'rgba(16,185,129,0.12)',
    alignItems: 'center',
    justifyContent: 'center'
  },

  pinnedIcon: {
    backgroundColor:
      'rgba(251,191,36,0.12)'
  },

  noteMain: {
    flex: 1,
    marginLeft: 11,
    marginRight: 10
  },

  noteTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900'
  },

  noteCategory: {
    color: colors.green,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4
  },

  descriptionText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 13
  },

  noteBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },

  dateText: {
    color: colors.muted,
    fontSize: 9,
    marginLeft: 5
  },

  actions: {
    flexDirection: 'row',
    gap: 16
  },

  empty: {
    alignItems: 'center',
    paddingTop: 70
  },

  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 22,
    backgroundColor:
      'rgba(251,191,36,0.12)',
    alignItems: 'center',
    justifyContent: 'center'
  },

  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 15
  },

  emptySub: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 6
  }

});