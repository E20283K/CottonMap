import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Title, IconButton, FAB, Button, List } from 'react-native-paper';
import { useResourcesStore } from '../../store/useResourcesStore';
import { useFieldsStore } from '../../store/useFieldsStore';
import { ResourceCard } from '../../components/resources/ResourceCard';
import { AddTransactionModal } from '../../components/resources/AddTransactionModal';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const ResourcesFieldScreen = ({ route, navigation }: any) => {
  const { fieldId } = route.params;
  const { fieldResources, fetchFieldResources, resourceTypes, fetchResourceTypes } = useResourcesStore();
  const { fields } = useFieldsStore();
  
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
      <ScrollView 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        style={styles.scroll}
      >
        <View style={styles.header}>
          <View>
            <Title style={styles.title}>{field?.name || 'Field Resources'}</Title>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{field?.area_hectares || 0} HA</Text>
            </View>
          </View>
          <IconButton icon="dots-vertical" onPress={() => {}} />
        </View>

        <View style={styles.content}>
          {resources.length === 0 && (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="filter-variant-plus" size={48} color="#CCC" />
              <Text style={styles.emptyText}>No resources added to this field yet.</Text>
              <Button mode="contained" onPress={() => handleAddPress()}>Add Transaction</Button>
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
        label="New Action"
        style={styles.fab}
        onPress={() => handleAddPress()}
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
    backgroundColor: '#F7F8FA',
  },
  scroll: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  badge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  badgeText: {
    color: '#2E7D32',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 60,
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
  },
});
