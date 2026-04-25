import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ResourceTransaction } from '../../types/resources';
import { format } from 'date-fns';

interface Props {
  transaction: ResourceTransaction;
  onPress?: () => void;
}

export const TransactionRow: React.FC<Props> = ({ transaction, onPress }) => {
  const isIncoming = transaction.transaction_type === 'incoming';
  const color = isIncoming ? '#4CAF50' : '#F44336';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.container}>
      <View style={[styles.leftBorder, { backgroundColor: color }]} />
      
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons 
          name={isIncoming ? 'arrow-down-circle' : 'arrow-up-circle'} 
          size={24} 
          color={color} 
        />
      </View>

      <View style={styles.mainContent}>
        <View style={styles.row}>
          <Text style={styles.typeText}>
            {isIncoming ? 'INCOMING' : 'OUTGOING'}
          </Text>
          <Text style={styles.timeText}>
            {format(new Date(transaction.transaction_date), 'HH:mm')}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.amountText}>
            {isIncoming ? '+' : '-'}{transaction.quantity} {transaction.resource_type?.unit}
          </Text>
          <Text style={styles.balanceText}>
            Bal: {transaction.balance_after?.toFixed(1)}
          </Text>
        </View>

        {transaction.supplier && (
          <Text style={styles.subText}>From: {transaction.supplier}</Text>
        )}
        {transaction.applied_by && (
          <Text style={styles.subText}>By: {transaction.applied_by}</Text>
        )}
        {transaction.reason && (
          <Text style={styles.reasonText}>{transaction.reason}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 1,
    minHeight: 70,
  },
  leftBorder: {
    width: 4,
    height: '100%',
  },
  iconContainer: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContent: {
    flex: 1,
    padding: 12,
    paddingLeft: 0,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#666',
  },
  timeText: {
    fontSize: 10,
    color: '#999',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  balanceText: {
    fontSize: 12,
    color: '#666',
  },
  subText: {
    fontSize: 12,
    color: '#444',
    marginTop: 2,
  },
  reasonText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#777',
    marginTop: 2,
  },
});
