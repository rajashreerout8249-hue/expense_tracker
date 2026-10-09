import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from './Icon';
import { colors } from '../theme';

export default function AppHeader({
  title = 'Expense Tracker',
  subtitle = 'Transactions'
}: {
  title?: string;
  subtitle?: string;
}) {
  const router = useRouter();

  return (
    <View style={s.wrap}>

      {/* Brand */}
      <View style={s.brand}>

        <View style={s.logo}>
          <Icon
            name="trending-up"
            size={23}
            color={colors.background}
          />
        </View>

        <View>
          <Text style={s.title}>
            {title}
          </Text>

          <Text style={s.sub}>
            {subtitle}
          </Text>
        </View>

      </View>

      {/* Actions */}
      <View style={s.actions}>

        <View style={s.currency}>
          <Text style={s.rupee}>
            ₹
          </Text>

          <Text style={s.cur}>
            INR
          </Text>
        </View>

        <TouchableOpacity
          style={s.iconBtn}
        >
          <Icon
            name="bell-outline"
            size={22}
            color={colors.muted}
          />

          <View style={s.dot} />
        </TouchableOpacity>

        <TouchableOpacity
          style={s.avatar}
          onPress={() => router.push('/profile')}
        >
          <Text style={s.avatarText}>
            RR
          </Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}

const s = StyleSheet.create({

  wrap: {
  height: 92,
  paddingTop: 18,
  paddingHorizontal: 16,

  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',

  backgroundColor: '#0B0F17',

  borderBottomWidth: 1,
  borderBottomColor: 'rgba(255,255,255,0.03)'
},

  brand: {
    flexDirection: 'row',
    alignItems: 'center'
  },

  logo: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text
  },

  sub: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.muted,
    marginTop: 1
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center'
  },

  currency: {
    height: 34,
    paddingHorizontal: 10,
    borderRadius: 18,
    backgroundColor: colors.surface2,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8
  },

  rupee: {
    color: colors.green,
    fontWeight: '800'
  },

  cur: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 12,
    marginLeft: 5
  },

  iconBtn: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4
  },

  dot: {
    position: 'absolute',
    right: 6,
    top: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.green
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.35)',
    backgroundColor: '#25352f',
    alignItems: 'center',
    justifyContent: 'center'
  },

  avatarText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text
  }

});