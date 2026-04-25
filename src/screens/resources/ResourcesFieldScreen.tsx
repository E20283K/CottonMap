import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Title, IconButton, FAB, Button, List } from 'react-native-paper';
import { useResourcesStore } from '../../store/useResourcesStore';
import { useFieldsStore } from '../../store/useFieldsStore';
import { ResourceCard } from '../../components/resources/ResourceCard';
import { AddTransactionModal } from '../../components/resources/AddTransactionModal';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLanguageStore } from '../../store/useLanguageStore';

export const ResourcesFieldScreen = ({ route, navigation }: any) => {
  const { fieldId } = route.params;
  const { fieldResources, fetchFieldResources, resourceTypes, fetchResourceTypes } = useResourcesStore();
  const { fields } = useFieldsStore();
  const { t } = useLanguageStore();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedResourceType, setSelectedResourceType] = useState<string | undefined>();

  const field = fields.find(f => f.id === fieldId);
  const resources = fieldResources[fieldId] || [];

  useEffect(() => {
    fetchFieldResources(fieldId);
    fetchResourceTypes();
  }, [fieldId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchFieldResources(fieldId), fetchResourceTypes()]);
    setRefreshing(false);
  };

  const handleAddPress = (typeId?: string) => {
    setSelectedResourceType(typeId);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{field?.name || t('field_resources')}</Text>
          <Text style={styles.subtitle}>{field?.area_hectares || 0} {t('hectares_of_cotton')}</Text>
        </View>
        <IconButton 
          icon="dots-vertical" 
          onPress={() => {}} 
          iconColor="#000"
        />
      </View>

      <ScrollView 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>{t('field_inventory').toUpperCase()}</Text>
          {resources.length === 0 && (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="filter-variant-plus" size={48} color="#CCC" />
              <Text style={styles.emptyText}>{t('no_resources_field')}</Text>
              <Button mode="contained" onPress={() => handleAddPress()}>{t('record_transaction')}</Button>
            </View>
          )}

          {resources.map((res) => (
            <ResourceCard 
              key={res.id} 
              resource={res} 
              onAddPress={() => handleAddPress(res.resource_type_id)}
              onPress={() => navigation.navigate('ResourceDetail', {
                fieldId,
                resourceTypeId: res.resource_type_id,
                fieldName: field?.name,
                resourceName: res.resource_type.name
              })}
            />
          ))}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      <FAB
        icon="plus"
        label={t('record_action')}
        style={styles.fab}
        onPress={() => handleAddPress()}
        color="#FFF"
        labelStyle={styles.fabLabel}
      />

      <AddTransactionModal 
        visible={modalVisible} 
        onDismiss={() => {
          setModalVisible(false);
          setSelectedResourceType(undefined);
        }} 
        initialFieldId={fieldId}
        initialResourceTypeId={selectedResourceType}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scroll: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#000',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 12,
    color: '#999',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#999',
    marginBottom: 20,
    letterSpacing: 1.5,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
    marginBottom: 24,
  },
  fab: {
    position: 'absolute',
    margin: 24,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    borderRadius: 16,
    elevation: 8,
  },
  fabLabel: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
