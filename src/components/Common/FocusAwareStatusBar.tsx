import * as React from 'react';
import { StatusBar, StatusBarProps } from 'expo-status-bar';
import { useIsFocused } from '@react-navigation/native';

export const FocusAwareStatusBar = (props: StatusBarProps) => {
  const isFocused = useIsFocused();

  if (!isFocused) {
    return null;
  }

  return <StatusBar {...props} animated={true} />;
};
