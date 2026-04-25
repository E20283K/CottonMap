import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Modal, Portal, Text, TextInput, Button, SegmentedButtons, IconButton, ActivityIndicator } from 'react-native-paper';
import { useResourcesStore } from '../../store/useResourcesStore';
import { useFieldsStore } from '../../store/useFieldsStore';
import { NewTransaction } from '../../types/resources';

// Conditional import for native picker
let DateTimePicker: any;
if (Platform.OS !== 'web') {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
}

interface Props {
  visible: boolean;
  onDismiss: () => void;
  initialFieldId?: string;
  initialResourceTypeId?: string;
}

export const AddTransactionModal: React.FC<Props> = ({ 
  visible, 
  onDismiss, 
  initialFieldId, 
  initialResourceTypeId 
}) => {
  const { resourceTypes, addTransaction } = useResourcesStore();
  const { fields } = useFieldsStore();

  const [type, setType] = useState<'incoming' | 'outgoing'>('incoming');
  const [fieldId, setFieldId] = useState(initialFieldId || '');
  const [resourceTypeId, setResourceTypeId] = useState(initialResourceTypeId || '');
  const [quantity, setQuantity] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [supplier, setSupplier] = useState('');
  const [appliedBy, setAppliedBy] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialFieldId) setFieldId(initialFieldId);
    if (initialResourceTypeId) setResourceTypeId(initialResourceTypeId);
  }, [initialFieldId, initialResourceTypeId]);

  const handleSave = async () => {
    if (!fieldId || !resourceTypeId || !quantity) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const tx: NewTransaction = {
        field_id: fieldId,
        resource_type_id: resourceTypeId,
        transaction_type: type,
        quantity: parseFloat(quantity),
        transaction_date: date.toISOString(),
        notes,
        ...(type === 'incoming' ? { supplier, unit_price: unitPrice ? parseFloat(unitPrice) : undefined } : { applied_by: appliedBy, reason }),
      };

      await addTransaction(tx);
      onDismiss();
      // Reset
      setQuantity('');
      setSupplier('');
      setAppliedBy('');
      setUnitPrice('');
      setReason('');
      setNotes('');
    } catch (err) {
      console.error(err);
      alert('Error saving transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedResourceType = resourceTypes.find(t => t.id === resourceTypeId);

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.title}>Record Transaction</Text>
          <IconButton icon="close" onPress={onDismiss} />
        </View>

        <SegmentedButtons
          value={type}
          onValueChange={v => setType(v as any)}
          buttons={[
            { value: 'incoming', label: 'Incoming ↓', checkedColor: '#4CAF50' },
            { value: 'outgoing', label: 'Outgoing ↑', checkedColor: '#F44336' },
          ]}
          style={styles.segmented}
        />

        <ScrollView style={styles.scroll}>
          <Text style={styles.label}>Select Field *</Text>
          <View style={styles.chipRow}>
            {fields.map(f => (
              <Button 
                key={f.id} 
                mode={fieldId === f.id ? 'contained' : 'outlined'}
                onPress={() => setFieldId(f.id)}
                style={styles.chip}
                compact
              >
                {f.name}
              </Button>
            ))}
          </View>

          <Text style={styles.label}>Resource Type *</Text>
          <View style={styles.chipRow}>
            {resourceTypes.map(t => (
              <Button 
                key={t.id} 
                mode={resourceTypeId === t.id ? 'contained' : 'outlined'}
                onPress={() => setResourceTypeId(t.id)}
                icon={t.icon as any}
                style={styles.chip}
                compact
              >
                {t.name}
              </Button>
            ))}
          </View>

          <View style={styles.row}>
            <TextInput
              label={`Quantity (${selectedResourceType?.unit || '...'}) *`}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              mode="outlined"
              style={styles.flexInput}
            />
            <Button 
              onPress={() => setShowDatePicker(true)} 
              mode="outlined" 
              style={styles.dateBtn}
            >
              {format(date, 'MMM dd')}
            </Button>
          </View>

          {showDatePicker && DateTimePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(e, d) => {
                setShowDatePicker(false);
                if (d) setDate(d);
              }}
            />
          )}

          {type === 'incoming' ? (
            <>
              <TextInput
                label="Supplier Name"
                value={supplier}
                onChangeText={setSupplier}
                mode="outlined"
                style={styles.input}
              />
              <TextInput
                label="Unit Price (Optional)"
                value={unitPrice}
                onChangeText={setUnitPrice}
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
              />
            </>
          ) : (
            <>
              <TextInput
                label="Applied By (Worker)"
                value={appliedBy}
                onChangeText={setAppliedBy}
                mode="outlined"
                style={styles.input}
              />
              <TextInput
                label="Reason / Purpose"
                value={reason}
                onChangeText={setReason}
                placeholder="e.g. 1st fertilization"
                mode="outlined"
                style={styles.input}
              />
            </>
          )}

          <TextInput
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            mode="outlined"
            style={styles.input}
          />

          <Button 
            mode="contained" 
            onPress={handleSave} 
            loading={submitting}
            disabled={submitting}
            style={[styles.saveBtn, { backgroundColor: type === 'incoming' ? '#4CAF50' : '#F44336' }]}
          >
            {type === 'incoming' ? 'Save Incoming ↓' : 'Save Outgoing ↑'}
          </Button>
        </ScrollView>
      </Modal>
    </Portal>
  );
};

// Simple format helper since we don't want to import full date-fns here if not needed
const format = (d: Date, f: string) => {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 10,
    borderRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  segmented: {
    marginBottom: 20,
  },
  scroll: {
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 10,
    marginBottom: 5,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  chip: {
    margin: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  flexInput: {
    flex: 1,
    marginRight: 10,
  },
  dateBtn: {
    height: 50,
    justifyContent: 'center',
  },
  input: {
    marginTop: 12,
  },
  saveBtn: {
    marginTop: 24,
    marginBottom: 10,
  },
});
