import React from 'react';
import { Card, Title, Paragraph, List, IconButton } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import { Task } from '../types';
import { Colors } from '../utils/colorPalette';
import { format } from 'date-fns';

interface Props {
  task: Task;
  onPress: () => void;
  onDelete?: () => void;
}

export const TaskCard: React.FC<Props> = ({ task, onPress, onDelete }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return Colors.priority.high;
      case 'medium': return Colors.priority.medium;
      case 'low': return Colors.priority.low;
      default: return Colors.primary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done': return 'check-circle';
      case 'in_progress': return 'progress-wrench';
      case 'pending': return 'clock-outline';
      default: return 'help-circle';
    }
  };

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <View style={styles.header}>
          <Title style={styles.title}>{task.title}</Title>
          <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(task.priority) }]} />
        </View>
        <List.Item
          title={task.status.replace('_', ' ').toUpperCase()}
          left={props => <List.Icon {...props} icon={getStatusIcon(task.status)} />}
          description={task.due_date ? `Due: ${format(new Date(task.due_date), 'MMM dd, yyyy')}` : 'No due date'}
        />
        {task.assigned_to && <Paragraph>Assigned to: {task.assigned_to}</Paragraph>}
      </Card.Content>
      <Card.Actions>
        {onDelete && <IconButton icon="delete" onPress={onDelete} iconColor={Colors.error} />}
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 4,
    borderRadius: 8,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    color: Colors.text,
  },
  priorityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
