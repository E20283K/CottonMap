import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Title, Avatar, List, Divider, Text } from 'react-native-paper';
import { useAuthStore } from '../store/useAuthStore';
import { Colors } from '../utils/colorPalette';

export const SettingsScreen = () => {
  const { user, signOut } = useAuthStore();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Avatar.Icon size={80} icon="account" backgroundColor={Colors.primary} />
        <Title style={styles.userName}>{user?.email}</Title>
      </View>

      <List.Section style={styles.section}>
        <List.Subheader>App Settings</List.Subheader>
        <List.Item
          title="Profile Information"
          left={(props) => <List.Icon {...props} icon="account-details" />}
          onPress={() => {}}
        />
        <Divider />
        <List.Item
          title="Notifications"
          left={(props) => <List.Icon {...props} icon="bell" />}
          onPress={() => {}}
        />
        <Divider />
        <List.Item
          title="Map Display Units"
          description="Hectares"
          left={(props) => <List.Icon {...props} icon="tape-measure" />}
          onPress={() => {}}
        />
      </List.Section>

      <View style={styles.footer}>
        <Button
          mode="outlined"
          onPress={signOut}
          textColor={Colors.error}
          style={styles.logoutBtn}
        >
          Logout
        </Button>
        <Text style={styles.version}>CottonMap v1.0.0</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 48,
    backgroundColor: Colors.surface,
  },
  userName: {
    marginTop: 16,
    color: Colors.text,
  },
  section: {
    backgroundColor: Colors.surface,
    marginTop: 16,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  logoutBtn: {
    width: '100%',
    borderColor: Colors.error,
  },
  version: {
    marginTop: 24,
    color: '#999',
    fontSize: 12,
  },
});
