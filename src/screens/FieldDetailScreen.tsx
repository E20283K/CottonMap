import React, { useEffect, useState, useMemo, useLayoutEffect } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Alert, Dimensions } from 'react-native';
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
import MapView, { Polygon, PROVIDER_GOOGLE } from 'react-native-maps';
import { AddTransactionModal } from '../components/resources/AddTransactionModal';
import { FieldResource } from '../types/resources';
import { AddTaskModal } from '../components/AddTaskModal';

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
  const [txModalVisible, setTxModalVisible] = useState(false);
  const [selectedResTypeId, setSelectedResTypeId] = useState<string | undefined>();
  
  // Edit Field State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editVariety, setEditVariety] = useState('');
  const [editSeason, setEditSeason] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchTasks();
    fetchFieldResources(fieldId);
  }, [fieldId]);

  if (!field) return null;

  const { t } = useLanguageStore();


  const openEditModal = () => {
    setEditName(field.name || '');
    setEditVariety(field.variety || '');
    setEditSeason(field.season || '');
    setEditNotes(field.notes || '');
    setEditModalVisible(true);
  };

  const handleUpdateField = async () => {
    if (!editName) return;
    setUpdating(true);
    try {
      await fieldsRepository.update(fieldId, {
        name: editName,
        variety: editVariety,
        season: editSeason,
        notes: editNotes,
      });
      setEditModalVisible(false);
    } catch (err) {
      console.error(err);
      Alert.alert(t('error') || 'Error', t('error_saving_field') || 'Error saving field');
    }
    setUpdating(false);
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
               Alert.alert(t('error') || 'Error', 'Error deleting field');
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
            <IconButton icon="square-edit-outline" size={20} onPress={openEditModal} />
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
              <View style={styles.tableLabelCell}><Text style={styles.tableLabel}>{t('variety').toUpperCase()}</Text></View>
              <View style={styles.tableValueCell}><Text style={styles.tableValue}>{field.variety || 'Standard'}</Text></View>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.tableLabelCell}><Text style={styles.tableLabel}>{t('season').toUpperCase()}</Text></View>
              <View style={styles.tableValueCell}><Text style={styles.tableValue}>{field.season || '—'}</Text></View>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.tableLabelCell}><Text style={styles.tableLabel}>{t('notes').toUpperCase()}</Text></View>
              <View style={styles.tableValueCell}><Text style={styles.tableValue}>{field.notes || '—'}</Text></View>
            </View>
            <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
              <View style={styles.tableLabelCell}><Text style={styles.tableLabel}>{t('created').toUpperCase()}</Text></View>
              <View style={styles.tableValueCell}><Text style={styles.tableValue}>{new Date(field.created_at).toLocaleDateString()}</Text></View>
            </View>
          </View>
        </View>

        {/* Linking / Parent / Child Section */}
        {field.field_type === 'sector' && childBlocks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>{t('blocks_caps')}</Text>
            <View style={styles.blocksContainer}>
              {childBlocks.map(block => (
                <TouchableOpacity 
                  key={block.id} 
                  style={styles.wideBlockCard}
                  onPress={() => navigation.push('FieldDetail', { fieldId: block.id })}
                >
                  <View style={styles.blockIconBox}>
                    <Text style={styles.blockIconText}>
                      {block.name.substring(0, 1).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.blockInfo}>
                    <Text style={styles.blockCardTitle} numberOfLines={1}>{block.name}</Text>
                    <Text style={styles.blockCardArea}>{formatHectares(block.area_hectares)} ha</Text>
                  </View>
                  <IconButton icon="chevron-right" size={20} iconColor="#CCC" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {field.field_type === 'block' && field.parent_id && (
           <View style={styles.section}>
             <Text style={styles.sectionHeader}>{t('location_caps')}</Text>
             <View style={styles.listItem}>
                <Text 
                  style={styles.listItemText}
                  onPress={() => navigation.push('FieldDetail', { fieldId: field.parent_id })}
                >
                  {t('belongs_to')} {fields.find(f => f.id === field.parent_id)?.name || t('sector')}
                </Text>
                <IconButton icon="arrow-up" size={20} />
             </View>
           </View>
        )}

        <Divider style={styles.sectionDivider} />

        {/* Resources */}
        <View style={styles.section}>
          <View style={styles.headerRow}>
            <Text style={styles.sectionHeader}>{t('resources_caps')}</Text>
            <Button 
              compact 
              labelStyle={styles.viewAllLabel} 
              onPress={() => navigation.navigate('Resources', { screen: 'ResourcesField', params: { fieldId: field.id } })}
            >
              {t('manage_caps')}
            </Button>
          </View>
          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={() => navigation.navigate('Resources', { screen: 'ResourcesField', params: { fieldId: field.id } })}
            style={styles.resourcesPreview}
          >
            {fieldResourcesData.slice(0, 3).map((res) => (
              <ResourceCard 
                key={res.id} 
                resource={res} 
                compact 
                onPress={() => navigation.navigate('Resources', { screen: 'ResourcesField', params: { fieldId: field.id } })}
              />
            ))}
            {fieldResourcesData.length === 0 && <Text style={styles.emptyText}>{t('no_active_resources')}</Text>}
            {fieldResourcesData.length > 3 && (
              <Text style={styles.moreText}>+ {fieldResourcesData.length - 3} {t('resources_caps').toLowerCase()}</Text>
            )}
          </TouchableOpacity>
        </View>

        <Divider style={styles.sectionDivider} />

        {/* Tasks */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>{t('recent_tasks').toUpperCase()}</Text>
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
          {fieldTasks.length === 0 && <Text style={styles.emptyText}>{t('no_pending_tasks')}</Text>}
        </View>
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        color="#FFF"
      />

      <AddTaskModal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        initialFieldId={fieldId}
        onSuccess={() => fetchTasks()}
      />


      <AddTransactionModal
        visible={txModalVisible}
        onDismiss={() => {
          setTxModalVisible(false);
          setSelectedResTypeId(undefined);
        }}
        initialFieldId={fieldId}
        initialResourceTypeId={selectedResTypeId}
      />

      <Portal>
        <Modal
          visible={editModalVisible}
          onDismiss={() => setEditModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <View style={styles.modalHeader}>
            <Title style={styles.modalTitle}>{t('edit_field') || 'Edit Field'}</Title>
            <IconButton 
              icon="close" 
              size={20} 
              onPress={() => setEditModalVisible(false)} 
              style={styles.modalClose}
            />
          </View>
          <ScrollView>
            <TextInput
              label={t('name')}
              value={editName}
              onChangeText={setEditName}
              mode="outlined"
              activeOutlineColor="#000"
              style={styles.input}
            />
            <TextInput
              label={t('variety')}
              value={editVariety}
              onChangeText={setEditVariety}
              mode="outlined"
              activeOutlineColor="#000"
              style={styles.input}
            />
            <TextInput
              label={t('season')}
              value={editSeason}
              onChangeText={setEditSeason}
              mode="outlined"
              keyboardType="numeric"
              activeOutlineColor="#000"
              style={styles.input}
            />
            <TextInput
              label={t('notes')}
              value={editNotes}
              onChangeText={setEditNotes}
              mode="outlined"
              multiline
              numberOfLines={3}
              activeOutlineColor="#000"
              style={styles.input}
            />
            <Button
              mode="contained"
              onPress={handleUpdateField}
              loading={updating}
              disabled={updating}
              style={styles.saveBtn}
            >
              {t('save')}
            </Button>
          </ScrollView>
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
  moreText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  resourcesPreview: {
    marginTop: 4,
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
    margin: 20,
    borderRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  modalClose: {
    margin: -8,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#FFF',
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    letterSpacing: 1,
    marginTop: 8,
  },
  radioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
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
    paddingVertical: 6,
  },
  blocksContainer: {
    marginTop: 12,
  },
  wideBlockCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  blockIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  blockIconText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
  },
  blockInfo: {
    flex: 1,
  },
  blockCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    marginBottom: 2,
  },
  blockCardArea: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
});
