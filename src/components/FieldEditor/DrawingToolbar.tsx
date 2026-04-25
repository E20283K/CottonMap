import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';
import { EditorMode } from '../../hooks/usePolygonEditor';
import { Colors } from '../../utils/colorPalette';

interface Props {
  mode: EditorMode;
  setMode: (mode: EditorMode) => void;
}

export const DrawingToolbar: React.FC<Props> = ({ mode, setMode }) => {
  return (
    <View style={styles.container}>
      <SegmentedButtons
        value={mode}
        onValueChange={value => setMode(value as EditorMode)}
        buttons={[
          { value: 'draw', label: 'Draw', icon: 'pencil' },
          { value: 'edit', label: 'Edit', icon: 'hand-back-right' },
          { value: 'view', label: 'View', icon: 'eye' },
        ]}
        style={styles.segmented}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    position: 'absolute',
    top: 40,
    width: '100%',
    zIndex: 10,
  },
  segmented: {
    backgroundColor: '#FFF',
    borderRadius: 50,
  }
});
