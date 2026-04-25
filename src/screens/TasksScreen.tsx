import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text, FAB } from 'react-native-paper';
import { useTasksStore } from '../store/useTasksStore';
import { TaskCard } from '../components/TaskCard';
import { tasksRepository } from '../database/tasksRepository';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLanguageStore } from '../store/useLanguageStore';
import { AddTaskModal } from '../components/AddTaskModal';
import { FocusAwareStatusBar } from '../components/Common/FocusAwareStatusBar';

export const TasksScreen = ({ navigation }: any) => {
  const { tasks, loading, fetchTasks } = useTasksStore();
  const { t } = useLanguageStore();
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  if (loading && tasks.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#000" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FocusAwareStatusBar style="dark" />
      {tasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="clipboard-check-outline" size={64} color="#EEE" />
          <Text style={styles.emptyTitle}>{t('all_caught_up')}</Text>
          <Text style={styles.emptyText}>{t('all_caught_up_sub')}</Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
              onDelete={async () => {
                await tasksRepository.delete(item.id);
                fetchTasks(); // Important: refresh list
              }}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        color="#FFF"
      />

      <AddTaskModal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        onSuccess={() => fetchTasks()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 80,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 24,
    color: '#000',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 16,
    bottom: 16,
    backgroundColor: '#000',
    borderRadius: 16,
  },
});
