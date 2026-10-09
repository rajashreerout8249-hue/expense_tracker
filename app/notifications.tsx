import React, { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { router } from 'expo-router';

import Icon from '@expo/vector-icons/Ionicons';

import { colors } from '../src/theme';

type NotificationItem = {
  _id?: string;
  id?: string;
  title?: string;
  message?: string;
  type?: string;
  read?: boolean;
  status?: string;
  scheduledAt?: string;
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] =
    useState<NotificationItem[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const loadNotifications = async () => {
    try {
      setLoading(true);

      /*
       * Backend notification loading can be
       * connected here later.
       *
       * For now we keep the screen safe and
       * crash-free.
       */

      setNotifications([]);
    } catch (error) {
      console.log(
        'Notification loading error:',
        error
      );

      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);

    await loadNotifications();

    setRefreshing(false);
  };

  const renderNotification = ({
    item,
  }: {
    item: NotificationItem;
  }) => {
    return (
      <View
        style={[
          styles.notificationCard,
          !item.read &&
            styles.unreadCard,
        ]}
      >
        <View style={styles.iconBox}>
          <Icon
            name="notifications-outline"
            size={22}
            color={colors.green}
          />
        </View>

        <View style={styles.content}>
          <Text
            style={styles.title}
            numberOfLines={1}
          >
            {item.title || 'Notification'}
          </Text>

          <Text
            style={styles.message}
            numberOfLines={3}
          >
            {item.message ||
              'You have a new notification.'}
          </Text>

          {item.scheduledAt && (
            <Text style={styles.date}>
              {String(item.scheduledAt)}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>

      {/* HEADER */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Icon
            name="arrow-back"
            size={23}
            color={colors.text}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Notifications
        </Text>

        <View style={styles.headerSpace} />
      </View>

      {/* CONTENT */}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color={colors.green}
          />

          <Text style={styles.loadingText}>
            Loading notifications...
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item, index) =>
            String(
              item._id ||
                item.id ||
                index
            )
          }
          renderItem={
            renderNotification
          }
          contentContainerStyle={
            notifications.length === 0
              ? styles.emptyContainer
              : styles.listContainer
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={
                handleRefresh
              }
              tintColor={colors.green}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <View
                style={styles.emptyIcon}
              >
                <Icon
                  name="notifications-off-outline"
                  size={40}
                  color={
                    colors.textSecondary
                  }
                />
              </View>

              <Text style={styles.emptyTitle}>
                No Notifications
              </Text>

              <Text style={styles.emptyText}>
                You don't have any
                notifications yet.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      colors.background,
  },

  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor:
      colors.card,
    alignItems: 'center',
    justifyContent:
      'center',
  },

  headerTitle: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '800',
  },

  headerSpace: {
    width: 44,
  },

  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },

  notificationCard: {
    backgroundColor:
      colors.card,
    borderRadius: 17,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#263044',
  },

  unreadCard: {
    borderColor:
      'rgba(55,116,90,0.5)',
  },

  iconBox: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor:
      'rgba(55,116,90,0.13)',
    alignItems: 'center',
    justifyContent:
      'center',
  },

  content: {
    flex: 1,
    marginLeft: 12,
  },

  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },

  message: {
    color:
      colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },

  date: {
    color:
      colors.textSecondary,
    fontSize: 11,
    marginTop: 7,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    color:
      colors.textSecondary,
    fontSize: 13,
    marginTop: 10,
  },

  emptyContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
  },

  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 25,
    backgroundColor:
      colors.card,
    alignItems: 'center',
    justifyContent:
      'center',
    marginBottom: 15,
  },

  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },

  emptyText: {
    color:
      colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
  },
});