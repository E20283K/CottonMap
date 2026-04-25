import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, FAB, IconButton, Surface } from 'react-native-paper';
import { useResourcesStore } from '../../store/useResourcesStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AddResourceTypeModal } from '../../components/resources/AddResourceTypeModal';
import { useLanguageStore } from '../../store/useLanguageStore';

export const ResourceTypesScreen = ({ navigation }: any) => {
  const { resourceTypes, fetchResourceTypes, loading, allSummary } = useResourcesStore();
  const { t } = useLanguageStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingType, setEditingType] = useState<any>(null);

  useEffect(() => {
    fetchResourceTypes();
  }, []);

  return (
    <View style={styles.container}>

      <FlatList
        data={resourceTypes}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const totalBalance = allSummary
            .filter(s => s.resource_type_id === item.id)
            .reduce((sum, s) => sum + Number(s.current_balance), 0);

          return (
            <TouchableOpacity 
              onPress={() => {
                setEditingType(item);
                setModalVisible(true);
              }}
              activeOpacity={0.7}
            >
              <Surface style={styles.card} elevation={0}>
                <View style={styles.iconBox}>
                  <MaterialCommunityIcons name={item.icon as any} size={22} color="#000" />
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.unitText}>{item.unit.toUpperCase()} {t('category').toUpperCase()}</Text>
                </View>
                <View style={styles.stockInfo}>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>{t('stocks').toUpperCase()}</Text>
                    <Text style={styles.statValue}>{totalBalance}</Text>
                  </View>
                  <View style={[styles.statBox, { marginLeft: 16 }]}>
                    <Text style={styles.statLabel}>{t('limit').toUpperCase()}</Text>
                    <Text style={[styles.statValue, { color: '#999' }]}>{item.low_stock_threshold}</Text>
                  </View>
                </View>
              </Surface>
            </TouchableOpacity>
          );
        }}
      />
      
      <FAB
        icon="plus"
        label={t('add_new_resource')}
        style={styles.fab}
        onPress={() => {
          setEditingType(null);
          setModalVisible(true);
        }}
        color="#FFF"
        labelStyle={styles.fabLabel}
      />

      <AddResourceTypeModal 
        visible={modalVisible} 
        editingType={editingType}
        onDismiss={() => {
          setModalVisible(false);
          setEditingType(null);
        }} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  list: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 100,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginVertical: 6,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  info: {
    flex: 1,
    marginLeft: 14,
  },
  name: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000',
    letterSpacing: -0.4,
  },
  unitText: {
    fontSize: 10,
    color: '#999',
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  unitText: {
    fontSize: 10,
    color: '#999',
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statBox: {
    alignItems: 'flex-end',
  },
  statLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#CCC',
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '900',
    color: '#000',
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
