import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Title, Paragraph, Button, Divider, List, FAB, Portal, Modal, TextInput, RadioButton } from 'react-native-paper';
import { useFieldsStore } from '../store/useFieldsStore';
import { useTasksStore } from '../store/useTasksStore';
import { TaskCard } from '../components/TaskCard';
import { Colors } from '../utils/colorPalette';
import { formatHectares } from '../utils/geoCalculations';
import { tasksRepository } from '../database/tasksRepository';

export const FieldDetailScreen = ({ route, navigation }: any) => {
  const { fieldId } = route.params;
  const field = useFieldsStore((state) => state.fields.find((f) => f.id === fieldId));
  const { tasks, fetchTasks } = useTasksStore();
  const fieldTasks = tasks.filter((t) => t.field_id === fieldId);

  const [modalVisible, setModalVisible] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  if (!field) return null;

  const handleAddTask = async () => {
    if (!taskTitle) return;
    setLoading(true);
    try {
      await tasksRepository.create({
        field_id: fieldId,
        title: taskTitle,
        priority,
        status: 'pending',
      });
      setModalVisible(false);
      setTaskTitle('');
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={[styles.header, { backgroundColor: field.color }]}>
          <Title style={styles.whiteText}>{field.name}</Title>
          <Paragraph style={styles.whiteText}>{formatHectares(field.area_hectares)} Hectares</Paragraph>
        </View>

        <View style={styles.section}>
          <Title>Information</Title>
          <Paragraph>Variety: {field.variety || 'Standard'}</Paragraph>
          <Paragraph>Season: {field.season || '2024'}</Paragraph>
          {field.notes && <Paragraph>Notes: {field.notes}</Paragraph>}
        </View>

        <Divider />

        <View style={styles.section}>
          <Title>Recent Tasks</Title>
          {fieldTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onPress={() => {}}
              onDelete={async () => {
                await tasksRepository.delete(task.id);
              }}
            />
          ))}
          {fieldTasks.length === 0 && <Paragraph>No tasks assigned to this field.</Paragraph>}
        </View>
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        color="#FFF"
      />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Title>Add Task</Title>
          <TextInput
            label="Task Title"
            value={taskTitle}
            onChangeText={setTaskTitle}
            mode="outlined"
            style={styles.input}
          />
          <Paragraph>Priority</Paragraph>
          <RadioButton.Group onValueChange={value => setPriority(value as any)} value={priority}>
            <View style={styles.radioItem}>
              <RadioButton value="low" />
              <Text>Low</Text>
            </View>
            <View style={styles.radioItem}>
              <RadioButton value="medium" />
              <Text>Medium</Text>
            </View>
            <View style={styles.radioItem}>
              <RadioButton value="high" />
              <Text>High</Text>
            </View>
          </RadioButton.Group>

          <Button
            mode="contained"
            onPress={handleAddTask}
            loading={loading}
            style={styles.saveBtn}
          >
            Add Task
          </Button>
        </Modal>
      </Portal>
    </View>
  );
};

// Simple Text component for radio button labels
const Text = ({ children }: any) => <Paragraph>{children}</Paragraph>;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  whiteText: {
    color: '#FFF',
  },
  section: {
    padding: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
  },
  modal: {
    backgroundColor: 'white',
    padding: 24,
    margin: 24,
    borderRadius: 12,
  },
  input: {
    marginVertical: 8,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveBtn: {
    marginTop: 16,
    backgroundColor: Colors.primary,
  }
});
