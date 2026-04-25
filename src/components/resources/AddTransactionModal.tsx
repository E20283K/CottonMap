import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Platform, Alert } from 'react-native';
import { Modal, Portal, Text, TextInput, Button, SegmentedButtons, IconButton, ActivityIndicator } from 'react-native-paper';
import { useResourcesStore } from '../../store/useResourcesStore';
import { useFieldsStore } from '../../store/useFieldsStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { NewTransaction } from '../../types/resources';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Conditional import for native picker
let DateTimePicker: any;
if (Platform.OS !== 'web') {
  try {
    DateTimePicker = require('@react-native-community/datetimepicker').default;
  } catch (e) {
    console.warn('DateTimePicker not found');
  }
}

interface Props {
  visible: boolean;
  onDismiss: () => void;
  initialFieldId?: string;
  initialResourceTypeId?: string;
  initialType?: 'incoming' | 'outgoing';
}

export const AddTransactionModal: React.FC<Props> = ({ 
  visible, 
  onDismiss, 
  initialFieldId, 
  initialResourceTypeId,
  initialType
}) => {
  const { resourceTypes, addTransaction } = useResourcesStore();
  const { t } = useLanguageStore();
  const { fields } = useFieldsStore();

  const [type, setType] = useState<'incoming' | 'outgoing'>(initialType || 'incoming');
  const [selectedSectorId, setSelectedSectorId] = useState<string | undefined>();
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
    if (initialFieldId) {
      setFieldId(initialFieldId);
      const field = fields.find(f => f.id === initialFieldId);
      if (field?.parent_id) {
        setSelectedSectorId(field.parent_id);
      } else if (field?.field_type === 'sector') {
        setSelectedSectorId(field.id);
      }
    }
    if (initialResourceTypeId) setResourceTypeId(initialResourceTypeId);
    if (initialType && visible) setType(initialType);
  }, [initialFieldId, initialResourceTypeId, initialType, fields, visible]);

  const handleSave = async () => {
    if (!fieldId || !resourceTypeId || !quantity) {
      alert(t('fill_required_fields') || 'Please fill in all required fields');
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
      alert(t('error_saving_transaction') || 'Error saving transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const sectors = useMemo(() => fields.filter(f => f.field_type === 'sector'), [fields]);
  const blocks = useMemo(() => {
    if (!selectedSectorId) return [];
    return fields.filter(f => f.parent_id === selectedSectorId);
  }, [fields, selectedSectorId]);

  const uniqueResourceTypes = useMemo(() => {
    const seen = new Set();
    return resourceTypes.filter(t => {
      const duplicate = seen.has(t.id);
      seen.add(t.id);
      return !duplicate;
    });
  }, [resourceTypes]);

  const selectedResourceType = uniqueResourceTypes.find(t => t.id === resourceTypeId);

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{t('record_event')}</Text>
            <Text style={styles.subtitle}>{t('inventory_transaction')}</Text>
          </View>
          <IconButton icon="close" onPress={onDismiss} style={styles.closeBtn} />
        </View>

        <SegmentedButtons
          value={type}
          onValueChange={v => setType(v as any)}
          buttons={[
            { value: 'incoming', label: t('stock_in'), checkedColor: '#000', labelStyle: styles.segLabel },
            { value: 'outgoing', label: t('usage'), checkedColor: '#000', labelStyle: styles.segLabel },
          ]}
          style={styles.segmented}
          density="medium"
        />

        <ScrollView 
          style={styles.scroll} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.label}>{t('allocation_sector')}</Text>
          <View style={styles.chipRow}>
            {sectors.map(s => (
              <Button 
                key={s.id} 
                mode={selectedSectorId === s.id ? 'contained' : 'outlined'}
                onPress={() => {
                  setSelectedSectorId(s.id);
                  if (s.id !== selectedSectorId) setFieldId(''); // Reset block if sector changes
                }}
                style={[styles.chip, selectedSectorId === s.id ? styles.activeChip : styles.inactiveChip]}
                labelStyle={styles.chipLabel}
                compact
              >
                {s.name}
              </Button>
            ))}
          </View>

          {selectedSectorId && blocks.length > 0 && (
            <>
              <Text style={styles.label}>{t('allocation_block')}</Text>
              <View style={styles.chipRow}>
                {blocks.map(b => (
                  <Button 
                    key={b.id} 
                    mode={fieldId === b.id ? 'contained' : 'outlined'}
                    onPress={() => setFieldId(b.id)}
                    style={[styles.chip, fieldId === b.id ? styles.activeChip : styles.inactiveChip]}
                    labelStyle={styles.chipLabel}
                    compact
                  >
                    {b.name}
                  </Button>
                ))}
              </View>
            </>
          )}

          <Text style={styles.label}>{t('resource').toUpperCase()}</Text>
          <View style={styles.chipRow}>
            {uniqueResourceTypes.map(t => (
              <Button 
                key={t.id} 
                mode={resourceTypeId === t.id ? 'contained' : 'outlined'}
                onPress={() => setResourceTypeId(t.id)}
                icon={t.icon as any}
                style={[styles.chip, resourceTypeId === t.id ? styles.activeChip : styles.inactiveChip]}
                labelStyle={styles.chipLabel}
                compact
              >
                {t.name}
              </Button>
            ))}
          </View>

          <View style={styles.row}>
            <TextInput
              label={`${t('quantity_short')} (${selectedResourceType?.unit || '...'})`}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              mode="outlined"
              activeOutlineColor="#000"
              outlineColor="#EEE"
              style={styles.flexInput}
            />
            <Button 
              onPress={() => setShowDatePicker(true)} 
              mode="outlined" 
              style={styles.dateBtn}
              textColor="#000"
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
                label={t('supplier')}
                value={supplier}
                onChangeText={setSupplier}
                mode="outlined"
                activeOutlineColor="#000"
                outlineColor="#EEE"
                style={styles.input}
              />
              <TextInput
                label={t('unit_price')}
                value={unitPrice}
                onChangeText={setUnitPrice}
                keyboardType="numeric"
                mode="outlined"
                activeOutlineColor="#000"
                outlineColor="#EEE"
                style={styles.input}
              />
            </>
          ) : (
            <>
              <TextInput
                label={t('worker')}
                value={appliedBy}
                onChangeText={setAppliedBy}
                mode="outlined"
                activeOutlineColor="#000"
                outlineColor="#EEE"
                style={styles.input}
              />
              <TextInput
                label={t('reason')}
                value={reason}
                onChangeText={setReason}
                placeholder={t('reason')}
                mode="outlined"
                activeOutlineColor="#000"
                outlineColor="#EEE"
                style={styles.input}
              />
            </>
          )}

          <TextInput
            label={t('notes')}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            mode="outlined"
            activeOutlineColor="#000"
            outlineColor="#EEE"
            style={styles.input}
          />

          <Button 
            mode="contained" 
            onPress={handleSave} 
            loading={submitting}
            disabled={submitting}
            style={styles.saveBtn}
            contentStyle={styles.saveBtnContent}
          >
            {type === 'incoming' ? t('save_transaction') : t('record_usage')}
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
    padding: 24,
    margin: 16,
    borderRadius: 28,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#000',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  closeBtn: {
    backgroundColor: '#F5F5F5',
    margin: 0,
  },
  segmented: {
    marginBottom: 24,
  },
  segLabel: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  scroll: {
    marginBottom: 0,
  },
  label: {
    fontSize: 11,
    fontWeight: '900',
    color: '#888',
    marginTop: 12,
    marginBottom: 8,
    letterSpacing: 1,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    marginHorizontal: -4,
  },
  chip: {
    margin: 4,
    borderRadius: 8,
  },
  activeChip: {
    backgroundColor: '#000',
  },
  inactiveChip: {
    borderColor: '#EEE',
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  flexInput: {
    flex: 1,
    marginRight: 12,
    backgroundColor: '#FFF',
  },
  dateBtn: {
    height: 50,
    justifyContent: 'center',
    borderRadius: 8,
    borderColor: '#EEE',
  },
  input: {
    marginTop: 12,
    backgroundColor: '#FFF',
  },
  saveBtn: {
    marginTop: 28,
    marginBottom: 8,
    backgroundColor: '#000',
    borderRadius: 14,
  },
  saveBtnContent: {
    height: 54,
  },
});
