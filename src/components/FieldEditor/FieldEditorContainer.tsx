import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import MapView, { Polygon, PROVIDER_GOOGLE, MapType } from 'react-native-maps';
import { Portal, Modal, Title, Button, Paragraph, IconButton } from 'react-native-paper';
import { usePolygonEditor } from '../../hooks/usePolygonEditor';
import { useLocation } from '../../hooks/useLocation';
import { MeasurementPanel } from './MeasurementPanel';
import { VertexHandle } from './VertexHandle';
import { MidpointHandle } from './MidpointHandle';
import { EdgeLengthLabel } from './EdgeLengthLabel';
import { DrawingToolbar } from './DrawingToolbar';
import { ActionBar } from './ActionBar';
import { Colors } from '../../utils/colorPalette';
import { Accelerometer } from 'expo-sensors';
import * as Haptics from 'expo-haptics';

interface Props {
  onSave: (vertices: any[], area: number) => void;
  onCancel: () => void;
  initialVertices?: any[];
}

export const FieldEditorContainer: React.FC<Props> = ({ onSave, onCancel, initialVertices = [] }) => {
  const editor = usePolygonEditor(initialVertices);
  const { location } = useLocation();
  const [mapType, setMapType] = useState<MapType>('satellite');
  const [vertexModalVisible, setVertexModalVisible] = useState(false);
  const mapRef = React.useRef<MapView>(null);

  useEffect(() => {
    if (location && mapRef.current && initialVertices.length === 0) {
      mapRef.current.animateToRegion({
        ...location,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 1000);
    }
  }, [!!location]);

  const handleCenterOnGPS = () => {
    if (location && mapRef.current) {
        mapRef.current.animateToRegion({
            ...location,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
        }, 800);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Shake to Undo
  useEffect(() => {
    let lastUpdate = 0;
    const subscription = Accelerometer.addListener(data => {
      const { x, y, z } = data;
      const acceleration = Math.sqrt(x * x + y * y + z * z);
      if (acceleration > 2.5) { // Sensitivity threshold
        const now = Date.now();
        if (now - lastUpdate > 1000) {
          lastUpdate = now;
          editor.undo();
        }
      }
    });
    Accelerometer.setUpdateInterval(100);
    return () => subscription.remove();
  }, [editor.undo]);

  const handleMapPress = (e: any) => {
    if (editor.mode === 'draw') {
      editor.addVertex(e.nativeEvent.coordinate);
    }
  };

  const handleVertexPress = (index: number) => {
    editor.setSelectedVertexIndex(index);
    setVertexModalVisible(true);
  };

  const midpoints = React.useMemo(() => {
    if (editor.vertices.length < 2) return [];
    const points = [];
    const len = editor.vertices.length;
    for (let i = 0; i < len; i++) {
      const nextIdx = (i + 1) % len;
      if (nextIdx === 0 && editor.mode === 'draw') continue;
      points.push({
        latitude: (editor.vertices[i].latitude + editor.vertices[nextIdx].latitude) / 2,
        longitude: (editor.vertices[i].longitude + editor.vertices[nextIdx].longitude) / 2,
        afterIndex: nextIdx,
      });
    }
    return points;
  }, [editor.vertices, editor.mode]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        mapType={mapType}
        style={styles.map}
        initialRegion={{
          latitude: initialVertices[0]?.latitude || location?.latitude || 37.78825,
          longitude: initialVertices[0]?.longitude || location?.longitude || -122.4324,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        showsUserLocation
        onPress={handleMapPress}
        scrollGestureEnabled={true} // Normally true, could disable when dragging
      >
        {editor.vertices.length >= 2 && (
          <Polygon
            coordinates={editor.vertices}
            fillColor="rgba(76, 175, 80, 0.15)"
            strokeColor="#2E7D32"
            strokeWidth={3}
          />
        )}

        {editor.mode !== 'view' && editor.vertices.map((v, i) => (
          <VertexHandle
            key={`${i}-${v.latitude}`}
            coordinate={v}
            index={i}
            isSelected={editor.selectedVertexIndex === i}
            isFirst={i === 0}
            onDragEnd={(coord) => {
              editor.pushToUndo(editor.vertices);
              editor.updateVertex(i, coord);
            }}
            onPress={() => handleVertexPress(i)}
          />
        ))}

        {editor.mode === 'edit' && midpoints.map((m, i) => (
          <MidpointHandle
            key={`mid-${i}`}
            coordinate={m}
            onPress={() => editor.insertVertex(m.afterIndex, m)}
          />
        ))}

        {editor.mode === 'edit' && editor.vertices.length >= 2 && editor.vertices.map((v, i) => {
           const nextIdx = (i + 1) % editor.vertices.length;
           if (nextIdx === 0 && editor.mode === 'draw') return null;
           return (
             <EdgeLengthLabel
               key={`label-${i}`}
               p1={v}
               p2={editor.vertices[nextIdx]}
             />
           );
        })}
      </MapView>

      <DrawingToolbar mode={editor.mode} setMode={editor.setMode} />

      <View style={styles.controlsLeft}>
        <IconButton
          icon="layers"
          mode="contained"
          onPress={() => setMapType(m => m === 'standard' ? 'satellite' : 'standard')}
          containerColor="#FFF"
        />
        <IconButton
            icon="crosshairs-gps"
            mode="contained"
            onPress={handleCenterOnGPS}
            containerColor="#FFF"
        />
      </View>

      <View style={styles.bottomContainer}>
        {editor.mode !== 'view' && (
          <MeasurementPanel
            area={editor.area}
            perimeter={editor.perimeter}
            points={editor.vertices.length}
          />
        )}
        <ActionBar
          mode={editor.mode}
          canUndo={editor.canUndo}
          onUndo={editor.undo}
          onClear={editor.clearAll}
          onCancel={onCancel}
          onSave={() => onSave(editor.vertices, editor.area)}
        />
      </View>

      <Portal>
        <Modal
          visible={vertexModalVisible}
          onDismiss={() => setVertexModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Title>Vertex {editor.selectedVertexIndex! + 1}</Title>
          <Button
            icon="delete"
            onPress={() => {
              editor.deleteVertex(editor.selectedVertexIndex!);
              setVertexModalVisible(false);
            }}
            textColor={Colors.error}
          >
            Delete Point
          </Button>
          <Button
            icon="map-marker-radius"
            onPress={() => {
              if (location) editor.updateVertex(editor.selectedVertexIndex!, location);
              setVertexModalVisible(false);
            }}
          >
            Set from My GPS
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
    ...StyleSheet.absoluteFillObject,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  controlsLeft: {
    position: 'absolute',
    top: 100,
    right: 16,
  },
  modal: {
    backgroundColor: 'white',
    padding: 24,
    margin: 24,
    borderRadius: 12,
  },
});
