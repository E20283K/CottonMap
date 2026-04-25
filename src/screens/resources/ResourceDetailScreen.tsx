import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { Text, Title, IconButton, FAB, Surface, Divider } from 'react-native-paper';
import { useResourcesStore } from '../../store/useResourcesStore';
import { TransactionRow } from '../../components/resources/TransactionRow';
import { AddTransactionModal } from '../../components/resources/AddTransactionModal';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useLanguageStore } from '../../store/useLanguageStore';

export const ResourceDetailScreen = ({ route, navigation }: any) => {
  const { fieldId, resourceTypeId, fieldName, resourceName } = route.params;
  const { transactions, fetchTransactions, fieldResources, deleteTransaction } = useResourcesStore();
  const { t } = useLanguageStore();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const txList = transactions[`${fieldId}-${resourceTypeId}`] || [];
  const resource = (fieldResources[fieldId] || []).find(r => r.resource_type_id === resourceTypeId);

  useEffect(() => {
    fetchTransactions(fieldId, resourceTypeId);
  }, [fieldId, resourceTypeId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions(fieldId, resourceTypeId);
    setRefreshing(false);
  };

  const handleDeleteTx = (txId: string) => {
    Alert.alert(
      t('delete_tx_title'),
      t('delete_tx_msg'),
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteTransaction(txId, fieldId, resourceTypeId)
        }
      ]
    );
  };

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, any[]> = {};
    txList.forEach(tx => {
      const dateKey = format(new Date(tx.transaction_date), 'yyyy-MM-dd');
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(tx);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [txList]);

  const totalIn = txList.filter(t => t.transaction_type === 'incoming').reduce((s, t) => s + Number(t.quantity), 0);
  const totalOut = txList.filter(t => t.transaction_type === 'outgoing').reduce((s, t) => s + Number(t.quantity), 0);

  const renderHeader = () => (
    <View>
      <View style={styles.topHeader}>
        <View style={styles.titleInfo}>
          <Title style={styles.title}>{resourceName}</Title>
          <View style={styles.subHeaderRow}>
            <Text style={styles.subTitle}>{fieldName}</Text>
            {resource?.low_stock_alert && (
              <View style={styles.lowStockPill}>
                <MaterialCommunityIcons name="alert-circle" size={10} color="#000" />
                <Text style={styles.lowStockText}>LOW STOCK</Text>
              </View>
            )}
          </View>
        </View>
        <Surface style={styles.balanceBadge} elevation={1}>
          <Text style={styles.balanceValue}>{resource?.current_balance || 0}</Text>
          <Text style={styles.balanceUnit}>{resource?.resource_type?.unit}</Text>
        </Surface>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>{t('total_in')}</Text>
          <Text style={[styles.statValue, { color: '#4CAF50' }]}>{totalIn.toFixed(0)}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>{t('total_out')}</Text>
          <Text style={[styles.statValue, { color: '#F44336' }]}>{totalOut.toFixed(0)}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>{t('entries')}</Text>
          <Text style={styles.statValue}>{txList.length}</Text>
        </View>
      </View>

      <Text style={styles.historyTitle}>{t('tx_history')}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={groupedTransactions}
        keyExtractor={item => item[0]}
        ListHeaderComponent={renderHeader}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContent}
        renderItem={({ item: [date, txs] }) => (
          <View style={styles.groupContainer}>
            <Text style={styles.dateHeader}>
              {format(new Date(date), 'EEEE, MMM dd, yyyy').toUpperCase()}
            </Text>
            {txs.map(tx => (
              <TransactionRow 
                key={tx.id} 
                transaction={tx} 
                onPress={() => handleDeleteTx(tx.id)} // For now, just delete on tap for demo
              />
            ))}
          </View>
        )}
      />

      <FAB
        icon="plus"
        label={t('record_short')}
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      />

      <AddTransactionModal 
        visible={modalVisible} 
        onDismiss={() => setModalVisible(false)} 
        initialFieldId={fieldId}
        initialResourceTypeId={resourceTypeId}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  listContent: {
    paddingBottom: 100,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  titleInfo: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lowStockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  lowStockText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#000',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  subTitle: {
    color: '#666',
  },
  balanceBadge: {
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  balanceValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  balanceUnit: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    margin: 20,
    color: '#333',
  },
  groupContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  dateHeader: {
    fontSize: 11,
    fontWeight: '900',
    color: '#999',
    marginBottom: 8,
    letterSpacing: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
  },
});
