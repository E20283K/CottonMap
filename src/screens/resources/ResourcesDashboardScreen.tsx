import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, FlatList } from 'react-native';
import { Text, Title, Button, IconButton, FAB, Surface } from 'react-native-paper';
import { useResourcesStore } from '../../store/useResourcesStore';
import { useFieldsStore } from '../../store/useFieldsStore';
import { ResourceCard } from '../../components/resources/ResourceCard';
import { AddTransactionModal } from '../../components/resources/AddTransactionModal';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const ResourcesDashboardScreen = ({ navigation }: any) => {
  const { allSummary, loading, fetchAllSummary, fetchResourceTypes, resourceTypes, subscribeToChanges } = useResourcesStore();
  const { fields, fetchFields } = useFieldsStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAllSummary();
    fetchResourceTypes();
    fetchFields();
    const unsubscribe = subscribeToChanges();
    return () => unsubscribe();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchAllSummary(), fetchResourceTypes(), fetchFields()]);
    setRefreshing(false);
  };

  // Group summary by field
  const fieldGroups = useMemo(() => {
    const groups: Record<string, any> = {};
    allSummary.forEach(item => {
      if (!item.field_id) return;
      if (!groups[item.field_id]) {
        groups[item.field_id] = {
          id: item.field_id,
          name: item.field?.name || 'Unknown Field',
          resources: []
        };
      }
      groups[item.field_id].resources.push(item);
    });
    return Object.values(groups);
  }, [allSummary]);

  // Global total per resource type
  const typeSummary = useMemo(() => {
    const summary: Record<string, any> = {};
    allSummary.forEach(item => {
      const typeId = item.resource_type_id;
      if (!summary[typeId]) {
        summary[typeId] = {
          name: item.resource_type?.name,
          unit: item.resource_type?.unit,
          icon: item.resource_type?.icon,
          color: item.resource_type?.color,
          total: 0,
          fieldCount: 0
        };
      }
      summary[typeId].total += Number(item.current_balance);
      summary[typeId].fieldCount += 1;
    });
    return Object.values(summary);
  }, [allSummary]);

  const lowStockCount = allSummary.filter(r => r.low_stock_alert).length;

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Title style={styles.title}>Resources</Title>
          <Button 
            mode="text" 
            icon="cog-outline" 
            onPress={() => navigation.navigate('ResourceTypes')}
          >
            Types
          </Button>
        </View>

        {lowStockCount > 0 && (
          <Surface style={styles.alertBanner} elevation={2}>
            <MaterialCommunityIcons name="alert-circle" size={24} color="#F44336" />
            <Text style={styles.alertText}>
              {lowStockCount} resource{lowStockCount > 1 ? 's are' : ' is'} low on stock
            </Text>
          </Surface>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.summaryScroll}>
          {typeSummary.map((type, idx) => (
            <Surface key={idx} style={styles.summaryCard} elevation={1}>
              <MaterialCommunityIcons name={type.icon as any} size={24} color={type.color} />
              <Text style={styles.summaryTotal}>{type.total.toFixed(0)} {type.unit}</Text>
              <Text style={styles.summaryName}>{type.name} total</Text>
              <Text style={styles.summarySub}>{type.fieldCount} fields</Text>
            </Surface>
          ))}
        </ScrollView>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Inventory by Field</Text>
          
          {fieldGroups.length === 0 && !loading && (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="warehouse" size={48} color="#CCC" />
              <Text style={styles.emptyText}>No resource data found.</Text>
              <Button onPress={() => setModalVisible(true)}>Add your first transaction</Button>
            </View>
          )}

          {fieldGroups.map((group) => (
            <View key={group.id} style={styles.fieldSection}>
              <View style={styles.fieldHeader}>
                <Text style={styles.fieldName}>{group.name}</Text>
                <IconButton 
                  icon="chevron-right" 
                  size={20} 
                  onPress={() => navigation.navigate('ResourcesField', { fieldId: group.id })} 
                />
              </View>
              {group.resources.map((res: any) => (
                <ResourceCard 
                  key={res.id} 
                  resource={res} 
                  compact 
                  onPress={() => navigation.navigate('ResourceDetail', { 
                    fieldId: group.id, 
                    resourceTypeId: res.resource_type_id,
                    fieldName: group.name,
                    resourceName: res.resource_type.name
                  })}
                />
              ))}
            </View>
          ))}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      <FAB
        icon="plus"
        label="Record Transaction"
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      />

      <AddTransactionModal 
        visible={modalVisible} 
        onDismiss={() => setModalVisible(false)} 
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
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 8,
  },
  alertText: {
    color: '#D32F2F',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  summaryScroll: {
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  summaryCard: {
    width: 130,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 5,
    backgroundColor: 'white',
  },
  summaryTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  summaryName: {
    fontSize: 12,
    color: '#666',
  },
  summarySub: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  fieldSection: {
    marginBottom: 24,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#999',
    marginTop: 10,
    marginBottom: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
  },
});
