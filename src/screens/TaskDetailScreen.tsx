import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, Surface, IconButton, Button, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTasksStore } from '../store/useTasksStore';
import { useFieldsStore } from '../store/useFieldsStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { tasksRepository } from '../database/tasksRepository';
import { format } from 'date-fns';

export const TaskDetailScreen = ({ route, navigation }: any) => {
  const { taskId } = route.params || {};
  const { tasks, fetchTasks } = useTasksStore();
  const fields = useFieldsStore(state => state.fields);
  const { t } = useLanguageStore();
  const [updating, setUpdating] = useState(false);

  const task = tasks.find(t => t.id === taskId);
  const field = fields.find(f => f.id === task?.field_id);

  if (!task) {
    return (
      <View style={styles.center}>
        <Text>{t('task_not_found')}</Text>
        <Button onPress={() => navigation.goBack()}>{t('go_back')}</Button>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      t('confirm'),
      t('confirm_delete_task'),
      [
        { text: t('cancel'), style: 'cancel' },
        { 
          text: t('delete'), 
          style: 'destructive',
          onPress: async () => {
            try {
              await tasksRepository.delete(task.id);
              fetchTasks();
              navigation.goBack();
            } catch (err) {
              Alert.alert(t('error') || 'Error', t('delete_task_error'));
            }
          }
        }
      ]
    );
  };

  const updateStatus = async (status: 'pending' | 'in_progress' | 'done') => {
    setUpdating(true);
    try {
      await tasksRepository.update(task.id, { status });
      fetchTasks();
    } catch (err) {
      Alert.alert(t('error') || 'Error', t('update_status_error'));
    } finally {
      setUpdating(false);
    }
  };

  const getPriorityInfo = (priority: string) => {
    switch (priority) {
      case 'high': return { color: '#000', label: t('high'), icon: 'chevron-double-up' };
      case 'medium': return { color: '#757575', label: t('medium'), icon: 'chevron-up' };
      case 'low': return { color: '#BDBDBD', label: t('low'), icon: 'chevron-down' };
      default: return { color: '#999', label: 'NONE', icon: 'minus' };
    }
  };

  const priorityInfo = getPriorityInfo(task.priority);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <Surface style={styles.headerCard} elevation={0}>
          <View style={[styles.statusBadge, { backgroundColor: task.status === 'done' ? '#4CAF5015' : '#00010' }]}>
            <MaterialCommunityIcons 
              name={task.status === 'done' ? 'check-circle' : 'clock-outline'} 
              size={16} 
              color={task.status === 'done' ? '#4CAF50' : '#333'} 
            />
            <Text style={[styles.statusText, { color: task.status === 'done' ? '#4CAF50' : '#333' }]}>
              {t(task.status as any).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.title}>{task.title}</Text>
          <Text style={styles.createdDate}>
            {t('created_on').replace('{date}', format(new Date(task.created_at), 'MMMM dd, yyyy'))}
          </Text>
        </Surface>

        {/* Field Link Section */}
        <TouchableOpacity 
          activeOpacity={0.7}
          style={styles.fieldLink}
          onPress={() => navigation.navigate('Fields', { screen: 'FieldDetail', params: { fieldId: field?.id } })}
        >
          <Surface style={styles.fieldCard} elevation={0}>
            <View style={[styles.fieldIndicator, { backgroundColor: field?.color || '#000' }]} />
            <View style={styles.fieldTextContainer}>
              <Text style={styles.fieldName}>{field?.label || field?.name || 'Unknown Field'}</Text>
              <Text style={styles.fieldLabel}>{field?.field_type === 'sector' ? t('sector') : t('block')}</Text>
            </View>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#CCC" />
          </Surface>
        </TouchableOpacity>

        {/* Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('priority')}</Text>
          <Surface style={styles.detailsCard} elevation={0}>
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <MaterialCommunityIcons name={priorityInfo.icon as any} size={20} color={priorityInfo.color} />
              </View>
              <View>
                <Text style={styles.detailLabel}>{t('priority')}</Text>
                <Text style={[styles.detailValue, { color: priorityInfo.color }]}>{priorityInfo.label}</Text>
              </View>
            </View>
            
            <Divider style={styles.divider} />

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <MaterialCommunityIcons name="calendar-range" size={20} color="#000" />
              </View>
              <View>
                <Text style={styles.detailLabel}>{t('due_date')}</Text>
                <Text style={styles.detailValue}>
                  {task.due_date ? format(new Date(task.due_date), 'MMMM dd, yyyy') : t('no_due_date')}
                </Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <MaterialCommunityIcons name="account-tie-outline" size={20} color="#000" />
              </View>
              <View>
                <Text style={styles.detailLabel}>{t('assigned_to')}</Text>
                <Text style={styles.detailValue}>{task.assigned_to || t('unassigned')}</Text>
              </View>
            </View>
          </Surface>
        </View>

        {/* Notes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('notes')}</Text>
          <Surface style={styles.notesCard} elevation={0}>
            <Text style={styles.notesText}>{task.notes || t('no_notes')}</Text>
          </Surface>
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <Surface style={styles.footer} elevation={4}>
        <View style={styles.actionButtons}>
          {task.status !== 'done' ? (
            <Button 
              mode="contained" 
              onPress={() => updateStatus('done')}
              style={styles.mainAction}
              labelStyle={styles.actionLabel}
              loading={updating}
              disabled={updating}
            >
              {t('mark_completed')}
            </Button>
          ) : (
            <Button 
              mode="outlined" 
              onPress={() => updateStatus('pending')}
              style={styles.mainActionOutlined}
              labelStyle={styles.actionLabelBlack}
              loading={updating}
              disabled={updating}
              textColor="#000"
            >
              {t('reopen_task')}
            </Button>
          )}
          <IconButton 
            icon="trash-can-outline" 
            mode="contained-tonal"
            containerColor="#F5F5F5"
            iconColor="#000"
            size={24}
            onPress={handleDelete}
            style={styles.deleteButton}
          />
        </View>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerCard: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    backgroundColor: '#FFF',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
    marginLeft: 6,
    letterSpacing: 1,
  },
  title: {
    fontSize: 34,
    fontWeight: '950',
    color: '#000',
    letterSpacing: -1.5,
    lineHeight: 40,
  },
  createdDate: {
    fontSize: 13,
    color: '#AAA',
    marginTop: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldLink: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  fieldCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 24,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  fieldIndicator: {
    width: 44,
    height: 44,
    borderRadius: 14,
    marginRight: 16,
  },
  fieldTextContainer: {
    flex: 1,
  },
  fieldName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000',
    letterSpacing: -0.5,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#AAA',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 12,
    marginLeft: 8,
  },
  detailsCard: {
    borderRadius: 24,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    padding: 18,
    alignItems: 'center',
  },
  detailIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 11,
    color: '#AAA',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  detailValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: '800',
    marginTop: 2,
  },
  divider: {
    backgroundColor: '#EEE',
    marginHorizontal: 20,
  },
  notesCard: {
    padding: 24,
    borderRadius: 24,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  notesText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainAction: {
    flex: 1,
    borderRadius: 20,
    height: 60,
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  mainActionOutlined: {
    flex: 1,
    borderRadius: 20,
    height: 60,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
    color: '#FFF',
  },
  actionLabelBlack: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
    color: '#000',
  },
  deleteButton: {
    marginLeft: 12,
    borderRadius: 20,
    width: 60,
    height: 60,
  },
});
