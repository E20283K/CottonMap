import React, { useEffect, useState, useMemo, useLayoutEffect } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Title, Paragraph, Button, Divider, FAB, Portal, Modal, TextInput, RadioButton, Appbar, IconButton, Text } from 'react-native-paper';
import { useFieldsStore } from '../store/useFieldsStore';
import { useTasksStore } from '../store/useTasksStore';
import { TaskCard } from '../components/TaskCard';
import { ResourceCard } from '../components/resources/ResourceCard';
import { useResourcesStore } from '../store/useResourcesStore';
import { Colors } from '../utils/colorPalette';
import { formatHectares } from '../utils/geoCalculations';
import { tasksRepository } from '../database/tasksRepository';
import { fieldsRepository } from '../database/fieldsRepository';
import { useLanguageStore } from '../store/useLanguageStore';
import { Alert, Dimensions } from 'react-native';
import MapView, { Polygon, PROVIDER_GOOGLE } from 'react-native-maps';

export const FieldDetailScreen = ({ route, navigation }: any) => {
  const { fieldId } = route.params;
  const fields = useFieldsStore((state) => state.fields);
  const { tasks, fetchTasks } = useTasksStore();
  const { fieldResources, fetchFieldResources } = useResourcesStore();

  const field = useMemo(() => fields.find((f) => f.id === fieldId), [fields, fieldId]);
  const fieldTasks = useMemo(() => tasks.filter((t) => t.field_id === fieldId), [tasks, fieldId]);
  const childBlocks = useMemo(() => fields.filter((f) => f.parent_id === fieldId), [fields, fieldId]);
  const fieldResourcesData = fieldResources[fieldId] || [];

  const [modalVisible, setModalVisible] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
    fetchFieldResources(fieldId);
  }, [fieldId]);

  if (!field) return null;

  const { t } = useLanguageStore();

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

  const handleDeleteField = () => {
    Alert.alert(
      t('delete_field') || 'Delete Field',
      t('delete_confirmation') || 'Are you sure you want to delete this field? This action cannot be undone.',
      [
        { text: t('cancel') || 'Cancel', style: 'cancel' },
        { 
          text: t('delete') || 'Delete', 
          style: 'destructive', 
          onPress: async () => {
             try {
               await fieldsRepository.delete(fieldId);
               navigation.goBack();
             } catch (err) {
               console.error(err);
               Alert.alert('Error deleting field');
             }
          }
        }
      ]
    );
  };

  const region = useMemo(() => {
    if (!field || !field.polygon_json || field.polygon_json.length === 0) return null;
    const lats = field.polygon_json.map(p => p.latitude);
    const lngs = field.polygon_json.map(p => p.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max((maxLat - minLat) * 1.3, 0.001),
      longitudeDelta: Math.max((maxLng - minLng) * 1.3, 0.001),
    };
  }, [field]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: field?.name || t('details'),
      headerRight: () => (
        <IconButton 
          icon="trash-can-outline" 
          onPress={handleDeleteField} 
          iconColor="#F44336" 
        />
      ),
      headerStyle: {
        backgroundColor: '#FFF',
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
      },
      headerTitleStyle: {
        fontWeight: '700',
        fontSize: 16,
      },
      headerTintColor: '#000',
    });
  }, [navigation, field, t, handleDeleteField]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Map Preview Frame */}
        {region && (
          <TouchableOpacity 
            activeOpacity={0.9} 
            style={styles.mapFrame}
            onPress={() => navigation.navigate('Map', { focusFieldId: field.id })}
          >
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.miniMap}
              region={region}
              scrollEnabled={false}
              zoomEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
              mapType="satellite"
              pointerEvents="none"
            >
              <Polygon
                coordinates={field.polygon_json}
                strokeColor="#FFFFFF"
                fillColor="rgba(255, 255, 255, 0.3)"
                strokeWidth={3}
              />
            </MapView>
          </TouchableOpacity>
        )}

        {/* Info Table */}
        <View style={styles.section}>
          <View style={styles.headerRow}>
            <Text style={styles.sectionHeader}>{t('details').toUpperCase()}</Text>
            <IconButton icon="square-edit-outline" size={20} onPress={() => {}} />
          </View>
          
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={styles.tableLabelCell}><Text style={styles.tableLabel}>{t('name')}</Text></View>
              <View style={styles.tableValueCell}><Text style={styles.tableValue}>{field.name}</Text></View>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.tableLabelCell}><Text style={styles.tableLabel}>{t('type')}</Text></View>
              <View style={styles.tableValueCell}><Text style={styles.tableValue}>{field.field_type.toUpperCase()}</Text></View>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.tableLabelCell}><Text style={styles.tableLabel}>{t('area')}</Text></View>
              <View style={styles.tableValueCell}><Text style={styles.tableValue}>{formatHectares(field.area_hectares)} ha</Text></View>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.tableLabelCell}><Text style={styles.tableLabel}>VARIETY</Text></View>
              <View style={styles.tableValueCell}><Text style={styles.tableValue}>{field.variety || 'Standard'}</Text></View>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.tableLabelCell}><Text style={styles.tableLabel}>SEASON</Text></View>
              <View style={styles.tableValueCell}><Text style={styles.tableValue}>{field.season || '2024'}</Text></View>
            </View>
            <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
              <View style={styles.tableLabelCell}><Text style={styles.tableLabel}>CREATED</Text></View>
              <View style={styles.tableValueCell}><Text style={styles.tableValue}>{new Date(field.created_at).toLocaleDateString()}</Text></View>
            </View>
          </View>
        </View>

        {/* Linking / Parent / Child Section */}
        {field.field_type === 'sector' && childBlocks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>BLOCKS</Text>
            {childBlocks.map(block => (
              <View key={block.id} style={styles.listItem}>
                <Text 
                  style={styles.listItemText}
                  onPress={() => navigation.push('FieldDetail', { fieldId: block.id })}
                >
                  {block.name} — {formatHectares(block.area_hectares)} ha
                </Text>
                <IconButton icon="chevron-right" size={20} />
              </View>
            ))}
          </View>
        )}

        {field.field_type === 'block' && field.parent_id && (
           <View style={styles.section}>
             <Text style={styles.sectionHeader}>LOCATION</Text>
             <View style={styles.listItem}>
                <Text 
                  style={styles.listItemText}
                  onPress={() => navigation.push('FieldDetail', { fieldId: field.parent_id })}
                >
                  Belongs to {fields.find(f => f.id === field.parent_id)?.name || 'Parent Sector'}
                </Text>
                <IconButton icon="arrow-up" size={20} />
             </View>
           </View>
        )}

        <Divider style={styles.sectionDivider} />

        {/* Resources */}
        <View style={styles.section}>
          <View style={styles.headerRow}>
            <Text style={styles.sectionHeader}>RESOURCES</Text>
            <Button compact labelStyle={styles.viewAllLabel} onPress={() => navigation.navigate('Resources', { screen: 'ResourcesField', params: { fieldId } })}>
              VIEW ALL
            </Button>
          </View>
          {fieldResourcesData.slice(0, 3).map((res) => (
            <ResourceCard 
              key={res.id} 
              resource={res} 
              compact 
              onPress={() => navigation.navigate('Resources', { 
                screen: 'ResourceDetail', 
                params: { fieldId, resourceTypeId: res.resource_type_id, fieldName: field.name, resourceName: res.resource_type.name } 
              })}
            />
          ))}
          {fieldResourcesData.length === 0 && <Text style={styles.emptyText}>No active resources.</Text>}
        </View>

        <Divider style={styles.sectionDivider} />

        {/* Tasks */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>RECENT TASKS</Text>
          {fieldTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onPress={() => {}}
              onDelete={async () => {
                await tasksRepository.delete(task.id);
                fetchTasks();
              }}
            />
          ))}
          {fieldTasks.length === 0 && <Text style={styles.emptyText}>No pending tasks.</Text>}
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
          <Title style={styles.modalTitle}>Add Task</Title>
          <TextInput
            label="Task Title"
            value={taskTitle}
            onChangeText={setTaskTitle}
            mode="outlined"
            activeOutlineColor="#000"
            style={styles.input}
          />
          <Text style={styles.label}>PRIORITY</Text>
          <RadioButton.Group onValueChange={value => setPriority(value as any)} value={priority}>
            <View style={styles.radioRow}>
              <View style={styles.radioItem}>
                <RadioButton value="low" color="#000" />
                <Text style={styles.radioLabel}>Low</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value="medium" color="#000" />
                <Text style={styles.radioLabel}>Med</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value="high" color="#000" />
                <Text style={styles.radioLabel}>High</Text>
              </View>
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



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  mapFrame: {
    height: 180,
    marginHorizontal: 24,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  miniMap: {
    ...StyleSheet.absoluteFillObject,
  },
  table: {
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFF',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    minHeight: 48,
  },
  tableLabelCell: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRightWidth: 1,
    borderRightColor: '#EEE',
  },
  tableValueCell: {
    flex: 2,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  tableLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    letterSpacing: 0.5,
  },
  tableValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#666',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  listItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  emptyText: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
  },
  sectionDivider: {
    marginHorizontal: 24,
    backgroundColor: '#F0F0F0',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 16,
    bottom: 16,
    backgroundColor: '#000',
  },
  modal: {
    backgroundColor: 'white',
    padding: 24,
    margin: 24,
    borderRadius: 0, // Brutalist style
    borderWidth: 2,
    borderColor: '#000',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#FFF',
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
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  saveBtn: {
    marginTop: 16,
    backgroundColor: '#000',
    borderRadius: 0,
  },
});
