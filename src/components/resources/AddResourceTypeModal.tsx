import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform, KeyboardAvoidingView, Alert } from 'react-native';
import { Modal, Portal, Text, TextInput, Button, IconButton } from 'react-native-paper';
import { useResourcesStore } from '../../store/useResourcesStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLanguageStore } from '../../store/useLanguageStore';

interface Props {
  visible: boolean;
  onDismiss: () => void;
  editingType?: any; // The resource type object being edited
}

const AVAILABLE_ICONS = [
  'cube-outline', 'flask-outline', 'sprout-outline', 'water-outline', 
  'gas-station-outline', 'truck-outline', 'barrel', 'bottle-wine-outline'
];

export const AddResourceTypeModal: React.FC<Props> = ({ visible, onDismiss, editingType }) => {
  const { addResourceType, updateResourceType, deleteResourceType } = useResourcesStore();
  const { t } = useLanguageStore();
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [threshold, setThreshold] = useState('10');
  const [icon, setIcon] = useState('cube-outline');
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (editingType) {
      setName(editingType.name);
      setUnit(editingType.unit);
      setThreshold(String(editingType.low_stock_threshold));
      setIcon(editingType.icon);
    } else {
      setName('');
      setUnit('');
      setThreshold('10');
      setIcon('cube-outline');
    }
  }, [editingType, visible]);

  const handleSave = async () => {
    if (!name || !unit) {
      alert(t('fill_name_unit') || 'Please fill in name and unit');
      return;
    }

    setSubmitting(true);
    try {
      if (editingType) {
        await updateResourceType(editingType.id, {
          name,
          unit,
          icon,
          low_stock_threshold: parseFloat(threshold) || 0,
        });
      } else {
        await addResourceType({
          name,
          unit,
          icon,
          low_stock_threshold: parseFloat(threshold) || 0,
        });
      }
      onDismiss();
    } catch (err) {
      console.error(err);
      alert(t('error_saving_resource_type') || 'Error saving resource type');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{editingType ? t('edit_resource') : t('new_resource')}</Text>
              <Text style={styles.subtitle}>{editingType ? t('update_catalog_item') : t('add_to_global_catalog')}</Text>
            </View>
            <IconButton icon="close" onPress={onDismiss} style={styles.closeBtn} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <TextInput
              label={t('resource_name')}
              placeholder={t('resource_name_placeholder')}
              value={name}
              onChangeText={setName}
              mode="outlined"
              activeOutlineColor="#000"
              outlineColor="#EEE"
              style={styles.input}
            />

            <View style={styles.row}>
              <TextInput
                label={t('unit')}
                placeholder={t('unit_placeholder')}
                value={unit}
                onChangeText={setUnit}
                mode="outlined"
                activeOutlineColor="#000"
                outlineColor="#EEE"
                style={styles.flexInput}
              />
              <TextInput
                label={t('low_stock_threshold')}
                value={threshold}
                onChangeText={setThreshold}
                keyboardType="numeric"
                mode="outlined"
                activeOutlineColor="#000"
                outlineColor="#EEE"
                style={styles.flexInput}
              />
            </View>

            <Text style={styles.label}>{t('select_icon').toUpperCase()}</Text>
            <View style={styles.iconRow}>
              {AVAILABLE_ICONS.map(i => (
                <IconButton
                  key={i}
                  icon={i}
                  size={24}
                  iconColor={icon === i ? '#FFF' : '#AAA'}
                  style={[styles.iconBtn, icon === i && styles.activeIconBtn]}
                  onPress={() => setIcon(i)}
                />
              ))}
            </View>

            <Button 
              mode="contained" 
              onPress={handleSave} 
              loading={submitting}
              disabled={submitting}
              style={styles.saveBtn}
              contentStyle={styles.saveBtnContent}
            >
              {editingType ? t('update_category') : t('create_category')}
            </Button>

            {editingType && (
              <Button 
                mode="text" 
                onPress={() => {
                  Alert.alert(
                    t('delete_category_confirm_title'),
                    t('delete_category_confirm_msg'),
                    [
                      { text: t('cancel'), style: 'cancel' },
                      { 
                        text: t('delete'), 
                        style: 'destructive',
                        onPress: async () => {
                          await deleteResourceType(editingType.id);
                          onDismiss();
                        }
                      }
                    ]
                  );
                }} 
                textColor="#F44336"
                style={styles.deleteBtn}
              >
                {t('delete_category')}
              </Button>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: 'white',
    padding: 24,
    margin: 16,
    borderRadius: 28,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#000',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  closeBtn: {
    backgroundColor: '#F5F5F5',
    margin: 0,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#FFF',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  flexInput: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#FFF',
  },
  label: {
    fontSize: 11,
    fontWeight: '900',
    color: '#888',
    marginTop: 12,
    marginBottom: 8,
    letterSpacing: 1,
  },
  iconRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 20,
  },
  iconBtn: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    margin: 4,
  },
  activeIconBtn: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  saveBtn: {
    marginTop: 12,
    backgroundColor: '#000',
    borderRadius: 14,
  },
  saveBtnContent: {
    height: 54,
  },
  deleteBtn: {
    marginTop: 8,
  },
});
