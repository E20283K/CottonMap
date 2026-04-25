import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Surface, Text, IconButton } from 'react-native-paper';
import { Task } from '../types';
import { format } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFieldsStore } from '../store/useFieldsStore';
import { useLanguageStore } from '../store/useLanguageStore';

interface Props {
  task: Task;
  onPress: () => void;
  onDelete?: () => void;
}

export const TaskCard: React.FC<Props> = ({ task, onPress, onDelete }) => {
  const fields = useFieldsStore(state => state.fields);
  const { t } = useLanguageStore();
  const field = fields.find(f => f.id === task.field_id);

  const getPriorityInfo = (priority: string) => {
    switch (priority) {
      case 'high': return { color: '#F44336', label: t('high').toUpperCase() };
      case 'medium': return { color: '#FF9800', label: t('medium').toUpperCase() };
      case 'low': return { color: '#4CAF50', label: t('low').toUpperCase() };
      default: return { color: '#999', label: '—' };
    }
  };

  const priorityInfo = getPriorityInfo(task.priority);

  return (
    <Surface style={styles.container} elevation={0}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <View style={styles.header}>
          <View style={styles.titleArea}>
            <Text style={styles.title}>{task.title}</Text>
            <Text style={styles.fieldName}>{field?.name || t('unknown_field')}</Text>
          </View>
          <View style={[styles.priorityBadge, { backgroundColor: priorityInfo.color + '15' }]}>
            <Text style={[styles.priorityText, { color: priorityInfo.color }]}>{priorityInfo.label}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.metaRow}>
            <MaterialCommunityIcons 
              name={task.status === 'done' ? 'check-circle' : 'clock-outline'} 
              size={16} 
              color={task.status === 'done' ? '#4CAF50' : '#888'} 
            />
            <Text style={[styles.statusText, { color: task.status === 'done' ? '#4CAF50' : '#666' }]}>
              {t(task.status).toUpperCase()}
            </Text>
            {task.due_date && (
              <>
                <View style={styles.dot} />
                <Text style={styles.dateText}>{format(new Date(task.due_date), 'MMM dd')}</Text>
              </>
            )}
          </View>
          
          {onDelete && (
            <IconButton 
              icon="trash-can-outline" 
              size={18} 
              onPress={onDelete} 
              iconColor="#CCC"
              style={styles.deleteBtn}
            />
          )}
        </View>
      </TouchableOpacity>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 20,
    marginVertical: 6,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleArea: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000',
    letterSpacing: -0.4,
  },
  fieldName: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#DDD',
    marginHorizontal: 8,
  },
  deleteBtn: {
    margin: -8,
  },
});
