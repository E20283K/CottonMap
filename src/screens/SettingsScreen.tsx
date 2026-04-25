import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { Avatar, Text, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { useFieldsStore } from '../store/useFieldsStore';
import { useTasksStore } from '../store/useTasksStore';
import { Colors } from '../utils/colorPalette';
import { FocusAwareStatusBar } from '../components/Common/FocusAwareStatusBar';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export const SettingsScreen = () => {
  const { user, signOut } = useAuthStore();
  const { language, setLanguage, t } = useLanguageStore();
  const { fields } = useFieldsStore();
  const { tasks } = useTasksStore();

  const handleLanguageChange = (lang: 'en' | 'uz') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLanguage(lang);
  };

  const handleLogout = () => {
    Alert.alert(
      t('logout'),
      t('confirm_logout') || 'Are you sure you want to log out?',
      [
        { text: t('cancel'), style: 'cancel' },
        { 
          text: t('logout'), 
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            signOut();
          }
        }
      ]
    );
  };

  const SettingItem = ({ icon, title, description, onPress, rightContent, danger }: any) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={() => {
        Haptics.selectionAsync();
        onPress && onPress();
      }}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, danger && styles.dangerIcon]}>
        <Ionicons name={icon} size={22} color={danger ? '#FF5252' : Colors.primary} />
      </View>
      <View style={styles.settingTextContent}>
        <Text style={[styles.settingTitle, danger && styles.dangerText]}>{title}</Text>
        {description && <Text style={styles.settingDescription}>{description}</Text>}
      </View>
      {rightContent ? rightContent : <Ionicons name="chevron-forward" size={20} color="#CCC" />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FocusAwareStatusBar style="dark" />
      
      <ScrollView bounces={true} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarWrapper}>
              <Avatar.Image 
                size={100} 
                source={{ uri: `https://ui-avatars.com/api/?name=${user?.email}&background=000&color=fff&size=200` }} 
                style={styles.avatar}
              />
              <View style={styles.badgeContainer}>
                <Ionicons name="shield-checkmark" size={14} color="#FFF" />
              </View>
            </View>
            
            <Text style={styles.emailText}>{user?.email?.split('@')[0] || 'User'}</Text>
            <Text style={styles.roleText}>{user?.email}</Text>

            {/* Stats Row */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{fields.length}</Text>
                <Text style={styles.statLabel}>{t('fields')}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{tasks.filter(t => t.status === 'done').length}</Text>
                <Text style={styles.statLabel}>{t('done')}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>Gold</Text>
                <Text style={styles.statLabel}>Tier</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>{t('settings').toUpperCase()}</Text>
          
          <View style={styles.card}>
            <SettingItem 
              icon="language-outline" 
              title={t('language')} 
              description={language === 'en' ? t('english') : t('uzbek')}
              rightContent={
                <View style={styles.langToggle}>
                  <TouchableOpacity 
                    onPress={() => handleLanguageChange('en')}
                    style={[styles.langBtn, language === 'en' && styles.langBtnActive]}
                  >
                    <Text style={[styles.langBtnText, language === 'en' && styles.langBtnTextActive]}>EN</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => handleLanguageChange('uz')}
                    style={[styles.langBtn, language === 'uz' && styles.langBtnActive]}
                  >
                    <Text style={[styles.langBtnText, language === 'uz' && styles.langBtnTextActive]}>UZ</Text>
                  </TouchableOpacity>
                </View>
              }
            />
            <Divider style={styles.cardDivider} />
            <SettingItem 
              icon="resize-outline" 
              title={t('map_units')} 
              description={t('hectares')} 
            />
          </View>

          <Text style={styles.sectionTitle}>SUPPORT</Text>
          <View style={styles.card}>
            <SettingItem 
              icon="help-circle-outline" 
              title={language === 'en' ? 'Help Center' : 'Yordam markazi'} 
            />
            <Divider style={styles.cardDivider} />
            <SettingItem 
              icon="information-circle-outline" 
              title={language === 'en' ? 'About CottonMap' : 'CottonMap haqida'} 
            />
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.logoutButtonText}>{t('logout')}</Text>
          </TouchableOpacity>

          <Text style={styles.versionFooter}>CottonMap Premium • v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerSafeArea: {
    backgroundColor: '#FFF',
  },
  profileHeader: {
    backgroundColor: '#FFF',
    paddingTop: 10,
    paddingBottom: 30,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    borderWidth: 1,
    borderColor: '#EEE',
    backgroundColor: '#FFF',
  },
  badgeContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#000',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emailText: {
    color: '#000',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    textTransform: 'capitalize',
  },
  roleText: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 24,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: width - 80,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: '#000',
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    color: '#999',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#DDD',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#999',
    marginBottom: 12,
    marginLeft: 4,
    letterSpacing: 1.5,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  dangerIcon: {
    backgroundColor: '#FFF0F0',
  },
  settingTextContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  settingDescription: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  dangerText: {
    color: '#FF5252',
  },
  cardDivider: {
    backgroundColor: '#F1F3F5',
    height: 1,
  },
  langToggle: {
    flexDirection: 'row',
    backgroundColor: '#F1F3F5',
    borderRadius: 10,
    padding: 4,
  },
  langBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  langBtnActive: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  langBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#999',
  },
  langBtnTextActive: {
    color: '#000',
  },
  logoutButton: {
    backgroundColor: '#000',
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  logoutButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  versionFooter: {
    textAlign: 'center',
    color: '#BBB',
    fontSize: 12,
    marginBottom: 40,
    fontWeight: '600',
  }
});

