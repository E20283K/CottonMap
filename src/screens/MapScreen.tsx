import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { StyleSheet, View, Dimensions, Text as NativeText, ScrollView, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import MapView, { Marker, Polygon, PROVIDER_GOOGLE, MapType } from 'react-native-maps';
import { IconButton, FAB, Portal, Modal, Title, Button, TextInput, SegmentedButtons, RadioButton, Text, Chip } from 'react-native-paper';
import { useLocation } from '../hooks/useLocation';
import { useFieldsStore } from '../store/useFieldsStore';
import { useRealtime } from '../hooks/useRealtime';
import { Colors } from '../utils/colorPalette';
import { usePolygonEditor } from '../hooks/usePolygonEditor';
import { Accelerometer } from 'expo-sensors';
import * as Haptics from 'expo-haptics';
import { MeasurementPanel } from '../components/FieldEditor/MeasurementPanel';
import { VertexHandle } from '../components/FieldEditor/VertexHandle';
import { MidpointHandle } from '../components/FieldEditor/MidpointHandle';
import { EdgeLengthLabel } from '../components/FieldEditor/EdgeLengthLabel';
import { DrawingToolbar } from '../components/FieldEditor/DrawingToolbar';
import { ActionBar } from '../components/FieldEditor/ActionBar';
import { FieldLabelMarker } from '../components/FieldLabelMarker';
import { fieldsRepository } from '../database/fieldsRepository';
import { computeCentroid } from '../utils/geoCalculations';
import { useLanguageStore } from '../store/useLanguageStore';
import { Field } from '../types';
import { FieldSearch } from '../components/FieldSearch';

export const MapScreen = ({ navigation, route }: any) => {

  const { t } = useLanguageStore();
  useRealtime();
  const { location } = useLocation();
  const { fields, fetchFields } = useFieldsStore();
  const [mapType, setMapType] = useState<MapType>('satellite');
  const mapRef = useRef<MapView>(null);

  const editor = usePolygonEditor();
  const [isEditorActive, setIsEditorActive] = useState(false);
  const [vertexModalVisible, setVertexModalVisible] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [label, setLabel] = useState('');
  const [fieldType, setFieldType] = useState<'sector' | 'block'>('block');
  const [parentId, setParentId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [regionDelta, setRegionDelta] = useState(0.01);
  const [viewMode, setViewMode] = useState<'all' | 'sectors'>('all');
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [selectedField, setSelectedField] = useState<Field | null>(null);

  useEffect(() => {
    fetchFields();
  }, []);


  const sectors = useMemo(() => fields.filter((f) => f.field_type === 'sector'), [fields]);
  const sortedFields = useMemo(() => [...fields].sort((a, b) => a.field_type === 'sector' ? -1 : 1), [fields]);



  const toggleMapType = () => {
    setMapType((current) => (current === 'standard' ? 'satellite' : current === 'satellite' ? 'hybrid' : 'standard'));
  };

  useEffect(() => {
    if (fields.length > 0 && mapRef.current && !isEditorActive) {
      // Gather all points from all field polygons to ensure everything fits perfectly and zoom is appropriate
      const allPoints = fields.flatMap(f => f.polygon_json);

      if (allPoints.length > 0) {
        mapRef.current.fitToCoordinates(allPoints, {
          edgePadding: { top: 300, right: 300, bottom: 300, left: 300 },
          animated: true,
        });
      }
    }
  }, [fields.length, isEditorActive]);

  useEffect(() => {
    if (location && mapRef.current && !isEditorActive && fields.length === 0) {
      mapRef.current.animateToRegion({
        ...location,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 1000);
    }
  }, [!!location, isEditorActive, fields.length]);

  const focusOnField = useCallback((field: Field) => {
    if (!mapRef.current) return;
    
    const centroid = (field.centroid_lat && field.centroid_lng)
      ? { latitude: Number(field.centroid_lat), longitude: Number(field.centroid_lng) }
      : (field.polygon_json.length >= 3 ? computeCentroid(field.polygon_json) : null);

    if (centroid) {
      mapRef.current.animateToRegion({
        ...centroid,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 1000);
      
      setSelectedField(field);
      setInfoModalVisible(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, []);

  // Handle focusing on a specific field from navigation params
  useEffect(() => {
    const focusFieldId = route.params?.focusFieldId;
    if (focusFieldId && fields.length > 0) {
       const fieldToFocus = fields.find(f => f.id === focusFieldId);
       if (fieldToFocus) {
          focusOnField(fieldToFocus);
          // Clear params to avoid refocusing on every render
          navigation.setParams({ focusFieldId: undefined });
       }
    }
  }, [route.params?.focusFieldId, fields.length, focusOnField]);

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
    if (!isEditorActive) return;
    let lastUpdate = 0;
    const subscription = Accelerometer.addListener(data => {
      const { x, y, z } = data;
      const acceleration = Math.sqrt(x * x + y * y + z * z);
      if (acceleration > 2.5) {
        const now = Date.now();
        if (now - lastUpdate > 1000) {
          lastUpdate = now;
          if (editor.canUndo) editor.undo();
        }
      }
    });
    Accelerometer.setUpdateInterval(100);
    return () => subscription.remove();
  }, [editor.undo, isEditorActive, editor.canUndo]);

  const toggleLabels = () => {
    setShowLabels(!showLabels);
  };

  const toggleViewMode = () => {
    const newMode = viewMode === 'all' ? 'sectors' : 'all';
    setViewMode(newMode);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleFieldPress = (field: Field) => {
    setSelectedField(field);
    setInfoModalVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };


  const handleMapPress = (e: any) => {

    if (isEditorActive && editor.mode === 'draw') {
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

  const startNewField = () => {
    setIsEditorActive(true);
    editor.clearAll();
    editor.setMode('draw');
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        ...location,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 1000);
    }
  };

  const handleSaveAttempt = () => {
    if (editor.vertices.length < 3) {
      alert(t('field_points_req'));
      return;
    }
    setSaveModalVisible(true);
  };

  const executeSaveField = async () => {
    if (!label) return;
    setSaving(true);
    try {
      const centroid = computeCentroid(editor.vertices);
      await fieldsRepository.create({
        name: label,
        label: label,
        field_type: fieldType,
        parent_id: fieldType === 'block' ? parentId : null,
        polygon_json: editor.vertices,
        area_hectares: editor.area,
        color: fieldType === 'sector' ? Colors.field.sector : Colors.field.block,
        centroid_lat: centroid.latitude,
        centroid_lng: centroid.longitude,
        season: new Date().getFullYear().toString(),
      });
      setSaveModalVisible(false);
      setIsEditorActive(false);
      setLabel('');
      setFieldType('block');
      setParentId(null);
      editor.clearAll();
    } catch (err) {
      console.error(err);
      alert(t('error_saving_field') || 'Error saving field');
    }
    setSaving(false);
  };

  const handleCancelEditor = () => {
    setIsEditorActive(false);
    editor.clearAll();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {!isEditorActive && (
        <SafeAreaView style={styles.searchContainer}>
          <FieldSearch 
            fields={fields} 
            onFieldSelect={focusOnField}
          />
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.chipsContainer}
          >
            <Chip 
              selected={viewMode === 'all'} 
              onPress={() => setViewMode('all')}
              style={styles.chip}
              mode="outlined"
              showSelectedOverlay
              icon="view-module"
            >
              {t('view_all') || "All"}
            </Chip>
            <Chip 
              selected={viewMode === 'sectors'} 
              onPress={() => setViewMode('sectors')}
              style={styles.chip}
              mode="outlined"
              showSelectedOverlay
              icon="office-building"
            >
              {t('sector') || "Sectors"}
            </Chip>
            <Chip 
              onPress={() => toggleLabels()}
              style={styles.chip}
              mode="outlined"
              icon={showLabels ? "label" : "label-off-outline"}
            >
              {t('label') || "Labels"}
            </Chip>
          </ScrollView>
        </SafeAreaView>
      )}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        mapType={mapType}
        style={styles.map}
        initialRegion={{
          latitude: 41.2995,
          longitude: 69.2401,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5,
        }}
        showsUserLocation
        showsMyLocationButton={false} 
        showsCompass={false} 
        onPress={handleMapPress}
        scrollGestureEnabled={true}
        onRegionChangeComplete={(region) => setRegionDelta(region.latitudeDelta)}
        removeClippedSubviews={false}
      >
        {/* Layer 1: All Field Polygons */}
        {sortedFields.map((field) => {
          if (viewMode === 'sectors' && field.field_type === 'block') return null;
          
          const isSector = field.field_type === 'sector';
          const baseColor = field.color || (isSector ? Colors.field.sector : Colors.field.block);
          const safeColor = baseColor.startsWith('#') ? baseColor : Colors.field.block;
          
          return (
            <Polygon
              key={`poly-${field.id}`}
              coordinates={field.polygon_json}
              // Sectors are transparent containers, Blocks have 15% fill for object definition
              fillColor={isSector ? 'transparent' : 'rgba(76, 175, 80, 0.15)'}
              strokeColor={isSector ? Colors.field.sector : Colors.field.block}
              strokeWidth={isSector ? 4 : 1.5}
              lineDashPattern={isSector ? [12, 8] : undefined}
              zIndex={isSector ? 10 : 5}
            />
          );
        })}

        {/* Layer 2: All Field Labels on top — hierarchical and zoom-adaptive */}
        {showLabels && sortedFields.map((field) => {
          if (viewMode === 'sectors' && field.field_type === 'block') return null;
          
          const isSector = field.field_type === 'sector';
          const centroid = (field.centroid_lat && field.centroid_lng) 
            ? { latitude: Number(field.centroid_lat), longitude: Number(field.centroid_lng) }
            : (field.polygon_json.length >= 3 ? computeCentroid(field.polygon_json) : null);

          if (!centroid) return null;

          // LOD Logic: Hide all labels/markers when zoomed out to keep the map clean
          const isVisible = regionDelta < 0.02;
          const showArea = true;

          return isVisible && (
            <FieldLabelMarker
              key={`label-${field.id}`}
              label={field.label || field.name}
              areaHectares={field.area_hectares}
              centroid={centroid}
              fieldType={field.field_type}
              showArea={showArea}
              color={isSector ? Colors.field.sector : Colors.field.block}
              onPress={() => handleFieldPress(field)}
            />
          );
        })}

        {/* Real-time Draft Label for active editor */}
        {isEditorActive && editor.vertices.length >= 3 && (
          <FieldLabelMarker
            label={t('new_field_draft')}
            areaHectares={editor.area}
            centroid={computeCentroid(editor.vertices)}
            color={Colors.primary}
          />
        )}


        {/* Editor Polygon and Handles */}
        {isEditorActive && editor.vertices.length >= 2 && (
          <Polygon
            coordinates={editor.vertices}
            fillColor="rgba(76, 175, 80, 0.1)"
            strokeColor={Colors.field.block}
            strokeWidth={3}
          />
        )}

        {isEditorActive && editor.mode !== 'view' && editor.vertices.map((v, i) => (
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

        {isEditorActive && editor.mode === 'edit' && midpoints.map((m, i) => (
          <MidpointHandle
            key={`mid-${i}`}
            coordinate={m}
            onPress={() => editor.insertVertex(m.afterIndex, m)}
          />
        ))}

        {isEditorActive && editor.mode === 'edit' && editor.vertices.length >= 2 && editor.vertices.map((v, i) => {
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

      {/* Right Sidebar Controls */}
      <View style={styles.controlsRight}>
        <IconButton
          icon="layers-outline"
          mode="contained"
          onPress={toggleMapType}
          containerColor="#FFF"
          iconColor={Colors.primary}
          style={styles.sideButton}
        />
        <IconButton
          icon="compass-outline"
          mode="contained"
          onPress={() => mapRef.current?.animateCamera({ heading: 0 })}
          containerColor="#FFF"
          iconColor={Colors.primary}
          style={styles.sideButton}
        />
      </View>

      {/* Bottom Right Controls (Stacked above FAB) */}
      {!isEditorActive && (
        <View style={styles.bottomRightGroup}>
          <IconButton
            icon="crosshairs-gps"
            mode="contained"
            onPress={handleCenterOnGPS}
            containerColor="#FFF"
            iconColor={Colors.primary}
            size={24}
            style={styles.gpsButton}
          />
        </View>
      )}

      {/* Editor specific overlays */}
      {isEditorActive ? (
        <>
          <DrawingToolbar mode={editor.mode} setMode={editor.setMode} />
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
              onCancel={handleCancelEditor}
              onSave={handleSaveAttempt}
            />
          </View>
        </>
      ) : (
        <FAB
          icon="plus"
          label={t('add_field')}
          style={styles.fab}
          onPress={startNewField}
          color={Colors.onPrimary}
        />
      )}

      {/* Portals */}
      <Portal>
        {/* Vertex Editing Modal */}
        <Modal
          visible={vertexModalVisible}
          onDismiss={() => setVertexModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Title>{t('points')} {editor.selectedVertexIndex !== null ? editor.selectedVertexIndex + 1 : ''}</Title>
          <Button
            icon="delete"
            onPress={() => {
              if (editor.selectedVertexIndex !== null) editor.deleteVertex(editor.selectedVertexIndex);
              setVertexModalVisible(false);
            }}
            textColor={Colors.error}
          >
            {t('delete_point')}
          </Button>
          <Button
            icon="map-marker-radius"
            onPress={() => {
              if (location && editor.selectedVertexIndex !== null) editor.updateVertex(editor.selectedVertexIndex, location);
              setVertexModalVisible(false);
            }}
          >
            {t('set_gps')}
          </Button>
        </Modal>

        {/* Save Field Modal */}
        <Modal
          visible={saveModalVisible}
          onDismiss={() => setSaveModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <ScrollView>
            <Title>{t('save')}</Title>
            
            <SegmentedButtons
              value={fieldType}
              onValueChange={v => setFieldType(v as 'sector' | 'block')}
              buttons={[
                { value: 'sector', label: t('sector') },
                { value: 'block', label: t('block') },
              ]}
              style={styles.segmented}
            />

            <TextInput
              label={fieldType === 'sector' ? t('sector_label') : t('block_label')}
              value={label}
              onChangeText={setLabel}
              mode="outlined"
              style={styles.input}
            />

            {fieldType === 'block' && sectors.length > 0 && (
              <View style={styles.parentSection}>
                <Text style={styles.sectionTitle}>{t('assign_to_sector')}</Text>
                <RadioButton.Group 
                  onValueChange={newValue => setParentId(newValue === 'none' ? null : newValue)} 
                  value={parentId || 'none'}
                >
                  <RadioButton.Item label="—" value="none" />
                  {sectors.map(sector => (
                    <RadioButton.Item key={sector.id} label={sector.name} value={sector.id} />
                  ))}
                </RadioButton.Group>
              </View>
            )}

            <Button
              mode="contained"
              onPress={executeSaveField}
              loading={saving}
              disabled={saving}
              style={styles.saveBtn}
            >
              {t('confirm')}
            </Button>
          </ScrollView>
        </Modal>

        {/* Field Info Modal */}
        <Modal
          visible={infoModalVisible}
          onDismiss={() => setInfoModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          {selectedField && (
            <View>
              <View style={styles.modalHeader}>
                <Title style={styles.modalTitle}>{selectedField.name}</Title>
                <IconButton 
                  icon="close" 
                  size={20} 
                  onPress={() => setInfoModalVisible(false)} 
                />
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('type')}:</Text>
                <Text style={styles.infoValue}>{t(selectedField.field_type)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('area')}:</Text>
                <Text style={styles.infoValue}>{selectedField.area_hectares.toFixed(2)} ha</Text>
              </View>
              {selectedField.parent_id && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{t('sector')}:</Text>
                  <Text style={styles.infoValue}>
                    {fields.find(f => f.id === selectedField.parent_id)?.name || '—'}
                  </Text>
                </View>
              )}
              
              <Button 
                mode="contained" 
                onPress={() => {
                  setInfoModalVisible(false);
                  navigation.navigate('Fields', { screen: 'FieldDetail', params: { fieldId: selectedField.id } });
                }}
                style={styles.detailsBtn}
                icon="arrow-right"
              >
                {t('view_details')}
              </Button>

              <Button 
                mode="outlined" 
                onPress={() => setInfoModalVisible(false)}
                style={styles.closeBtn}
                textColor="#666"
              >
                {t('close')}
              </Button>
            </View>
          )}
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
  searchContainer: {
    position: 'absolute',
    top: 45,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  chipsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  chip: {
    backgroundColor: '#FFF',
    elevation: 2,
    height: 34,
    borderRadius: 17,
  },
  controlsRight: {
    position: 'absolute',
    top: 180,
    right: 12,
  },
  bottomRightGroup: {
    position: 'absolute',
    bottom: 90,
    right: 12,
    alignItems: 'center',
  },
  sideButton: {
    marginVertical: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderRadius: 12,
  },
  gpsButton: {
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    borderRadius: 25,
    backgroundColor: '#FFF',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
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
  segmented: {
    marginVertical: 16,
  },
  parentSection: {
    marginVertical: 8,
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  saveBtn: {
    marginTop: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontWeight: 'bold',
  },
  closeBtn: {
    marginTop: 8,
  },
  detailsBtn: {
    marginTop: 24,
    backgroundColor: '#000',
  },
});
