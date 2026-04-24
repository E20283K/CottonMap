import React, { useEffect } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Title, List } from 'react-native-paper';
import { useTasksStore } from '../store/useTasksStore';
import { TaskCard } from '../components/TaskCard';
import { Colors } from '../utils/colorPalette';
import { tasksRepository } from '../database/tasksRepository';

export const TasksScreen = () => {
  const { tasks, loading, fetchTasks } = useTasksStore();

  useEffect(() => {
    fetchTasks();
  }, []);

  if (loading && tasks.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Title style={styles.headerTitle}>All Tasks</Title>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onPress={() => {}}
            onDelete={async () => {
              await tasksRepository.delete(item.id);
            }}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  headerTitle: {
    marginBottom: 16,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 24,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
