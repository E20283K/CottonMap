import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, FlatList, TouchableOpacity } from 'react-native';
import { Text, Title, Button, IconButton, FAB, Surface } from 'react-native-paper';
import { useResourcesStore } from '../../store/useResourcesStore';
import { useFieldsStore } from '../../store/useFieldsStore';
import { ResourceCard } from '../../components/resources/ResourceCard';
import { AddTransactionModal } from '../../components/resources/AddTransactionModal';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLanguageStore } from '../../store/useLanguageStore';

export const ResourcesDashboardScreen = ({ navigation }: any) => {
  const { allSummary, loading, fetchAllSummary, fetchResourceTypes, resourceTypes, subscribeToChanges } = useResourcesStore();
  const { fields, fetchFields } = useFieldsStore();
  const { t } = useLanguageStore();
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
          name: item.field?.name || t('unknown_field'),
          resources: []
        };
      }
      groups[item.field_id].resources.push(item);
    });
    return Object.values(groups);
  }, [allSummary, t]);

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
        showsVerticalScrollIndicator={false}
      >
        {lowStockCount > 0 && (
          <Surface style={styles.alertCard} elevation={0}>
            <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#000" />
            <Text style={styles.alertText}>
              {t('attention_low_stock').replace('{count}', String(lowStockCount))}
            </Text>
          </Surface>
        )}

        <View style={styles.summaryContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.summaryScroll} contentContainerStyle={styles.summaryScrollContent}>
            {typeSummary.map((type, idx) => (
              <Surface key={idx} style={styles.summaryCard} elevation={0}>
                <View style={styles.summaryIconBox}>
                  <MaterialCommunityIcons name={type.icon as any} size={20} color="#000" />
                </View>
                <Text style={styles.summaryTotal}>{(type.total || 0).toFixed(0)} {type.unit}</Text>
                <Text style={styles.summaryName}>{type.name}</Text>
                <Text style={styles.summarySub}>{type.fieldCount} {t('fields_count').split(' ')[1]}</Text>
              </Surface>
            ))}
          </ScrollView>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>{t('allocation_by_field')}</Text>
          
          {fieldGroups.length === 0 && !loading && (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="warehouse" size={48} color="#EEE" />
              <Text style={styles.emptyTitle}>{t('inventory_empty')}</Text>
              <Text style={styles.emptySubtitle}>{t('inventory_empty_sub')}</Text>
            </View>
          )}

          {fieldGroups.map((group) => (
            <View key={group.id} style={styles.fieldSection}>
              <View style={styles.fieldHeader}>
                <Text style={styles.fieldName}>{group.name}</Text>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('ResourcesField', { fieldId: group.id })}
                >
                  <Text style={styles.viewAllText}>{t('view_all_caps')}</Text>
                </TouchableOpacity>
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
        <View style={{ height: 120 }} />
      </ScrollView>

      <FAB
        icon="plus"
        label={t('record_transaction')}
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        color="#FFF"
        labelStyle={styles.fabLabel}
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
    backgroundColor: '#FFF',
  },
  scroll: {
    flex: 1,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 12,
    marginHorizontal: 24,
    marginTop: 16,
    borderRadius: 16,
  },
  alertText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 12,
    marginLeft: 12,
    letterSpacing: 0.2,
  },
  summaryContainer: {
    marginTop: 20,
  },
  summaryScroll: {
    paddingLeft: 24,
  },
  summaryScrollContent: {
    paddingRight: 24,
    paddingBottom: 10,
  },
  summaryCard: {
    width: 120,
    padding: 16,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  summaryIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  summaryTotal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000',
    letterSpacing: -0.5,
  },
  summaryName: {
    fontSize: 12,
    color: '#666',
    fontWeight: '700',
    marginTop: 2,
  },
  summarySub: {
    fontSize: 10,
    color: '#AAA',
    fontWeight: '800',
    marginTop: 8,
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
  fieldSection: {
    marginBottom: 40,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  fieldName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#000',
    letterSpacing: -0.5,
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#888',
    letterSpacing: 1,
    marginBottom: 4,
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
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
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
