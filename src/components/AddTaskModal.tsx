import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Modal, Portal, TextInput, Button, RadioButton, Text, IconButton, Title } from 'react-native-paper';
import { useLanguageStore } from '../store/useLanguageStore';
import { useFieldsStore } from '../store/useFieldsStore';
import { tasksRepository } from '../database/tasksRepository';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface AddTaskModalProps {
  visible: boolean;
  onDismiss: () => void;
  initialFieldId?: string;
  onSuccess?: () => void;
}

export const AddTaskModal = ({ visible, onDismiss, initialFieldId, onSuccess }: AddTaskModalProps) => {
  const { t } = useLanguageStore();
  const fields = useFieldsStore((state) => state.fields);
  
  const [taskTitle, setTaskTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [selectedFieldId, setSelectedFieldId] = useState<string | undefined>(initialFieldId);
  const [loading, setLoading] = useState(false);
  const [showFieldPicker, setShowFieldPicker] = useState(false);

  useEffect(() => {
    if (visible) {
      setTaskTitle('');
      setPriority('medium');
      setSelectedFieldId(initialFieldId);
      setShowFieldPicker(false);
    }
  }, [visible, initialFieldId]);

  const handleAddTask = async () => {
    if (!taskTitle || !selectedFieldId) return;
    setLoading(true);
    try {
      await tasksRepository.create({
        field_id: selectedFieldId,
        title: taskTitle,
        priority,
        status: 'pending',
      });
      onSuccess?.();
      onDismiss();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const selectedFieldName = fields.find(f => f.id === selectedFieldId)?.name || t('select_field');

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <View style={styles.modalHeader}>
          <Title style={styles.modalTitle}>{t('add_task')}</Title>
          <IconButton 
            icon="close" 
            size={20} 
            onPress={onDismiss} 
            style={styles.modalClose}
          />
        </View>

        <TextInput
          label={t('task_title')}
          value={taskTitle}
          onChangeText={setTaskTitle}
          mode="outlined"
          activeOutlineColor="#000"
          style={styles.input}
        />

        {!initialFieldId && (
          <View style={styles.fieldSelectorContainer}>
            <Text style={styles.label}>{t('field').toUpperCase()}</Text>
            <TouchableOpacity 
              style={styles.fieldSelector} 
              onPress={() => setShowFieldPicker(!showFieldPicker)}
            >
              <MaterialCommunityIcons name="silo" size={20} color="#000" style={{ marginRight: 8 }} />
              <Text style={styles.fieldSelectorText}>{selectedFieldName}</Text>
              <MaterialCommunityIcons 
                name={showFieldPicker ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>

            {showFieldPicker && (
              <ScrollView style={styles.fieldList} nestedScrollEnabled>
                {fields.map(field => (
                  <TouchableOpacity 
                    key={field.id} 
                    style={styles.fieldOption}
                    onPress={() => {
                      setSelectedFieldId(field.id);
                      setShowFieldPicker(false);
                    }}
                  >
                    <Text style={[
                      styles.fieldOptionText,
                      selectedFieldId === field.id && styles.selectedFieldOptionText
                    ]}>
                      {field.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        )}

        <Text style={styles.label}>{t('priority_caps')}</Text>
        <RadioButton.Group onValueChange={value => setPriority(value as any)} value={priority}>
          <View style={styles.radioRow}>
            <View style={styles.radioItem}>
              <RadioButton value="low" color="#000" />
              <Text style={styles.radioLabel}>{t('low')}</Text>
            </View>
            <View style={styles.radioItem}>
              <RadioButton value="medium" color="#000" />
              <Text style={styles.radioLabel}>{t('medium')}</Text>
            </View>
            <View style={styles.radioItem}>
              <RadioButton value="high" color="#000" />
              <Text style={styles.radioLabel}>{t('high')}</Text>
            </View>
          </View>
        </RadioButton.Group>

        <Button
          mode="contained"
          onPress={handleAddTask}
          loading={loading}
          disabled={loading || !taskTitle || !selectedFieldId}
          style={styles.saveBtn}
          contentStyle={{ height: 48 }}
        >
          {t('add_task')}
        </Button>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: 'white',
    padding: 24,
    margin: 20,
    borderRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000',
    letterSpacing: -0.5,
  },
  modalClose: {
    margin: -8,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#FFF',
  },
  label: {
    fontSize: 10,
    fontWeight: '900',
    color: '#666',
    letterSpacing: 1.5,
    marginTop: 8,
    marginBottom: 8,
  },
  fieldSelectorContainer: {
    marginBottom: 16,
  },
  fieldSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FAFAFA',
  },
  fieldSelectorText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  fieldList: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: '#FFF',
  },
  fieldOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  fieldOptionText: {
    fontSize: 14,
    color: '#666',
  },
  selectedFieldOptionText: {
    color: '#000',
    fontWeight: '700',
  },
  radioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
    color: '#333',
  },
  saveBtn: {
    marginTop: 16,
    backgroundColor: '#000',
    borderRadius: 12,
  },
});
