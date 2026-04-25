import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Title, Avatar, List, Divider, Text } from 'react-native-paper';
import { useAuthStore } from '../store/useAuthStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { Colors } from '../utils/colorPalette';

export const SettingsScreen = () => {
  const { user, signOut } = useAuthStore();
  const { language, setLanguage, t } = useLanguageStore();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Avatar.Icon size={80} icon="account" backgroundColor={Colors.onSurface} color="#FFF" />
        <Title style={styles.userName}>{user?.email}</Title>
      </View>

      <List.Section style={styles.section}>
        <List.Subheader>{t('settings')}</List.Subheader>
        <List.Accordion
          title={t('language')}
          description={language === 'en' ? t('english') : t('uzbek')}
          left={(props) => <List.Icon {...props} icon="translate" />}
        >
          <List.Item 
            title={t('english')} 
            onPress={() => setLanguage('en')}
            right={() => language === 'en' ? <List.Icon icon="check" /> : null}
          />
          <List.Item 
            title={t('uzbek')} 
            onPress={() => setLanguage('uz')}
            right={() => language === 'uz' ? <List.Icon icon="check" /> : null}
          />
        </List.Accordion>
        <Divider />
        <List.Item
          title={t('map_units')}
          description={t('hectares')}
          left={(props) => <List.Icon {...props} icon="tape-measure" />}
          onPress={() => {}}
        />
      </List.Section>

      <View style={styles.footer}>
        <Button
          mode="outlined"
          onPress={signOut}
          textColor="#000"
          style={styles.logoutBtn}
        >
          {t('logout')}
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
