import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { Colors } from '../../utils/colorPalette';

interface Props {
  onSave: () => void;
  onCancel: () => void;
  onUndo: () => void;
  onClear: () => void;
  canUndo: boolean;
  mode: 'draw' | 'edit' | 'view';
}

export const ActionBar: React.FC<Props> = ({ onSave, onCancel, onUndo, onClear, canUndo, mode }) => {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Button 
          mode="contained" 
          onPress={onSave} 
          style={styles.btn} 
          buttonColor={Colors.primary}
          icon="check"
        >
          {mode === 'draw' ? 'Finish' : 'Save'}
        </Button>
        
        <IconButton
          icon="undo"
          mode="contained"
          disabled={!canUndo}
          onPress={onUndo}
          containerColor="#EEE"
        />

        <Button 
          mode="outlined" 
          onPress={onClear} 
          style={styles.btn} 
          textColor={Colors.error}
          icon="delete-sweep"
        >
          Clear
        </Button>

        <Button 
          mode="text" 
          onPress={onCancel} 
          style={styles.btn}
          textColor="#666"
        >
          Cancel
        </Button>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    elevation: 8,
  },
  scroll: {
    paddingHorizontal: 16,
    alignItems: 'center',
    flexDirection: 'row',
  },
  btn: {
    marginRight: 8,
    borderRadius: 8,
  },
});
