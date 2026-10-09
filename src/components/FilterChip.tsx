import React from 'react';

import {
  TouchableOpacity,
  Text,
  StyleSheet
} from 'react-native';

import { colors } from '../theme';

type FilterChipProps = {
  title: string;
  active?: boolean;
  onPress: () => void;
};

export default function FilterChip({
  title,
  active = false,
  onPress
}: FilterChipProps) {

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.chip,
        active && styles.activeChip
      ]}
    >

      <Text
        style={[
          styles.text,
          active && styles.activeText
        ]}
      >
        {title}
      </Text>

    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({

  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,

    borderRadius: 20,

    backgroundColor: colors.card,

    borderWidth: 1,
    borderColor: colors.border,

    marginRight: 8
  },

  activeChip: {
    backgroundColor: colors.green,
    borderColor: colors.green
  },

  text: {
    color: colors.muted,

    fontSize: 13,
    fontWeight: '700'
  },

  activeText: {
    color: colors.background
  }

});