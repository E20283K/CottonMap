import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';
import { EditorMode } from '../../hooks/usePolygonEditor';
import { Colors } from '../../utils/colorPalette';

import { useLanguageStore } from '../../store/useLanguageStore';

interface Props {
  mode: EditorMode;
  setMode: (mode: EditorMode) => void;
}

export const DrawingToolbar: React.FC<Props> = ({ mode, setMode }) => {
  const { t } = useLanguageStore();
  
  return (
    <View style={styles.container}>
      <SegmentedButtons
        value={mode}
        onValueChange={value => setMode(value as EditorMode)}
        buttons={[
          { value: 'draw', label: t('draw'), icon: 'pencil' },
          { value: 'edit', label: t('edit'), icon: 'hand-back-right' },
          { value: 'view', label: t('view'), icon: 'eye' },
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
