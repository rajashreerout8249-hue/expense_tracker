import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Props = {
  name: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  size?: number;
  color?: string;
};
export function Icon({name,size=22,color='#F8FAFC'}: Props) {
  return <MaterialCommunityIcons name={name} size={size} color={color} />;
}