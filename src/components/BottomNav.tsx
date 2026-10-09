import React from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';

import {
  usePathname,
  useRouter
} from 'expo-router';

import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Icon } from './Icon';
import { colors } from '../theme';

type NavItemType = {
  key: string;
  label: string;
  icon: React.ComponentProps<
    typeof MaterialCommunityIcons
  >['name'];
};

const items: NavItemType[] = [
  {
    key: '/',
    label: 'Home',
    icon: 'view-dashboard-outline'
  },
  {
    key: '/history',
    label: 'History',
    icon: 'notebook-outline'
  },
  {
    key: '/budget',
    label: 'Budget',
    icon: 'wallet-outline'
  },
  {
    key: '/profile',
    label: 'Profile',
    icon: 'account-outline'
  }
];

export default function BottomNav() {
  const router = useRouter();
  const path = usePathname();

  return (
    <View style={styles.bar}>

      {/* Home */}
      <NavItem
        item={items[0]}
        active={path === '/'}
        onPress={() => router.replace('/')}
      />

      {/* History */}
      <NavItem
        item={items[1]}
        active={path === '/history'}
        onPress={() =>
          router.replace('/history')
        }
      />

      {/* Add Transaction */}
      <TouchableOpacity
        style={styles.plus}
        onPress={() =>
          router.push('/add-transaction')
        }
      >
        <Text style={styles.plusText}>
          +
        </Text>
      </TouchableOpacity>

      {/* Budget */}
      <NavItem
        item={items[2]}
        active={path === '/budget'}
        onPress={() =>
          router.replace('/budget')
        }
      />

      {/* Profile */}
      <NavItem
        item={items[3]}
        active={path === '/profile'}
        onPress={() =>
          router.replace('/profile')
        }
      />

    </View>
  );
}

function NavItem({
  item,
  active,
  onPress
}: {
  item: NavItemType;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.item}
      onPress={onPress}
    >
      <Icon
        name={item.icon}
        size={23}
        color={
          active
            ? colors.green
            : colors.muted
        }
      />

      <Text
        style={[
          styles.label,
          active && styles.active
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({

  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 78,
    paddingBottom: 8,
    backgroundColor: '#0D121B',
    borderTopWidth: 1,
    borderTopColor:
      'rgba(255,255,255,0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around'
  },

  item: {
    width: 64,
    alignItems: 'center'
  },

  label: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.muted,
    marginTop: 3
  },

  active: {
    color: colors.green
  },

  plus: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -25,
    elevation: 12
  },

  plusText: {
    fontSize: 38,
    lineHeight: 40,
    fontWeight: '400',
    color: colors.background
  }

});