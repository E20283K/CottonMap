import React, { useState, useRef } from 'react';
import { StyleSheet, View, Dimensions, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polygon, PROVIDER_GOOGLE } from 'react-native-maps';
import { IconButton, FAB, Portal, Modal, TextInput, Button, Title } from 'react-native-paper';
import { useLocation } from '../hooks/useLocation';
import { useFieldsStore } from '../store/useFieldsStore';
import { useRealtime } from '../hooks/useRealtime';
import { Colors } from '../utils/colorPalette';
import { calculateArea } from '../utils/geoCalculations';
import { LatLng } from '../types';
import { fieldsRepository } from '../database/fieldsRepository';

export const MapScreen = () => {
  useRealtime();
  const { location } = useLocation();
  const fields = useFieldsStore((state) => state.fields);
  const [drawingCoords, setDrawingCoords] = useState<LatLng[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [fieldName, setFieldName] = useState('');
  const [loading, setLoading] = useState(false);
  const mapRef = useRef<MapView>(null);

  const startDrawing = () => {
    setDrawingCoords([]);
    setIsDrawing(true);
  };

  const handleMapPress = (e: any) => {
    if (!isDrawing) return;
    setDrawingCoords([...drawingCoords, e.nativeEvent.coordinate]);
  };

  const finishDrawing = () => {
    if (drawingCoords.length < 3) {
      alert('Draw at least 3 points for a field.');
      return;
    }
    setModalVisible(true);
  };

  const handleSaveField = async () => {
    if (!fieldName) return;
    setLoading(true);
    try {
      const area = calculateArea(drawingCoords);
      await fieldsRepository.create({
        name: fieldName,
        polygon_json: drawingCoords,
        area_hectares: area,
        color: Colors.field.ready,
      });
      setModalVisible(false);
      setIsDrawing(false);
      setDrawingCoords([]);
      setFieldName('');
    } catch (err) {
      console.error(err);
      alert('Error saving field');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: location?.latitude || 37.78825,
          longitude: location?.longitude || -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation
        onPress={handleMapPress}
      >
        {fields.map((field) => (
          <Polygon
            key={field.id}
            coordinates={field.polygon_json}
            fillColor={`${field.color}40`}
            strokeColor={field.color}
            strokeWidth={2}
          />
        ))}

        {isDrawing && drawingCoords.map((coord, index) => (
          <Marker key={index} coordinate={coord} />
        ))}

        {isDrawing && drawingCoords.length > 1 && (
          <Polygon
            coordinates={drawingCoords}
            fillColor="rgba(0, 150, 0, 0.2)"
            strokeColor={Colors.primary}
            strokeWidth={2}
          />
        )}
      </MapView>

      {!isDrawing ? (
        <FAB
          icon="plus"
          label="New Field"
          style={styles.fab}
          onPress={startDrawing}
          color={Colors.onPrimary}
        />
      ) : (
        <View style={styles.drawingControls}>
          <Button mode="contained" onPress={finishDrawing} style={styles.controlBtn}>
            Save
          </Button>
          <Button mode="outlined" onPress={() => setIsDrawing(false)} style={styles.controlBtn}>
            Cancel
          </Button>
        </View>
      )}

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Title>New Field Details</Title>
          <TextInput
            label="Field Name"
            value={fieldName}
            onChangeText={setFieldName}
            mode="outlined"
            style={styles.input}
          />
          <Button
            mode="contained"
            onPress={handleSaveField}
            loading={loading}
            disabled={loading}
          >
            Confirm & Save
          </Button>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
  },
  drawingControls: {
    position: 'absolute',
    bottom: 32,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  controlBtn: {
    flex: 1,
    marginHorizontal: 8,
  },
  modal: {
    backgroundColor: 'white',
    padding: 24,
    margin: 24,
    borderRadius: 12,
  },
  input: {
    marginVertical: 16,
  },
});
