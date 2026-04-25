import React, { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, View, RefreshControl, TouchableOpacity } from 'react-native';
import { ActivityIndicator, Title, Text, List, Surface, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFieldsStore } from '../store/useFieldsStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { FieldCard } from '../components/FieldCard';
import { Colors } from '../utils/colorPalette';

export const FieldsListScreen = ({ navigation }: any) => {
  const { fields, loading, fetchFields } = useFieldsStore();
  const { t } = useLanguageStore();
  const [expandedSectors, setExpandedSectors] = React.useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchFields();
  }, []);

  const toggleSector = (id: string) => {
    setExpandedSectors(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const { sectors, standaloneBlocks } = useMemo(() => {
    // Group everything
    const allSectors = fields.filter(f => f.field_type === 'sector');
    const allBlocks = fields.filter(f => f.field_type === 'block');

    const groupedSectors = allSectors.map(sector => {
      const children = allBlocks.filter(b => b.parent_id === sector.id);
      return { ...sector, children };
    });

    const soloBlocks = allBlocks.filter(b => !b.parent_id);

    return { sectors: groupedSectors, standaloneBlocks: soloBlocks };
  }, [fields]);

  if (loading && fields.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchFields} />
        }
      >
        <List.Section>
          {sectors.length > 0 && <Title style={styles.sectionTitle}>{t('sector')}</Title>}
          {sectors.map(sector => (
            <Surface key={sector.id} style={styles.sectorCard} elevation={2}>
              <View style={styles.sectorHeader}>
                <TouchableOpacity 
                  style={styles.headerPressArea}
                  onPress={() => toggleSector(sector.id)}
                >
                  <MaterialCommunityIcons name="folder" size={32} color={Colors.primary} style={styles.folderIcon} />
                  <View style={styles.headerTextContainer}>
                    <Text style={styles.sectorName} numberOfLines={1}>{sector.label || sector.name}</Text>
                    <Text style={styles.sectorMetadata} numberOfLines={1}>
                      {sector.children.length} {t('block')} • {(sector.area_hectares || 0).toFixed(1)} ha
                    </Text>
                  </View>
                </TouchableOpacity>

                <View style={styles.headerActions}>
                  <IconButton 
                    icon="information-outline" 
                    mode="contained-tonal"
                    containerColor="#F5F5F5"
                    iconColor={Colors.primary}
                    size={20}
                    onPress={() => navigation.navigate('FieldDetail', { fieldId: sector.id })}
                  />
                  <IconButton 
                    icon={expandedSectors[sector.id] ? "chevron-up" : "chevron-down"} 
                    onPress={() => toggleSector(sector.id)}
                  />
                </View>
              </View>

              {expandedSectors[sector.id] && (
                <View style={styles.gridContainer}>
                  {sector.children.map(block => (
                    <TouchableOpacity 
                      key={block.id} 
                      style={styles.gridItem}
                      onPress={() => navigation.navigate('FieldDetail', { fieldId: block.id })}
                    >
                      <Surface style={styles.tile} elevation={1}>
                        <MaterialCommunityIcons name="file-outline" size={24} color={block.color || Colors.primary} />
                        <Text numberOfLines={1} style={styles.gridText}>{block.label || block.name}</Text>
                        <Text style={styles.gridSubtext}>{(block.area_hectares || 0).toFixed(1)} ha</Text>
                      </Surface>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </Surface>
          ))}
        </List.Section>

        {standaloneBlocks.length > 0 && (
          <List.Section>
            <Title style={styles.sectionTitle}>{t('standalone_blocks')}</Title>
            <View style={[styles.gridContainer, { backgroundColor: 'transparent' }]}>
              {standaloneBlocks.map(block => (
                <TouchableOpacity 
                  key={block.id} 
                  style={styles.gridItem}
                  onPress={() => navigation.navigate('FieldDetail', { fieldId: block.id })}
                >
                  <Surface style={styles.tile} elevation={1}>
                    <MaterialCommunityIcons name="file-outline" size={24} color={block.color || Colors.primary} />
                    <Text numberOfLines={1} style={styles.gridText}>{block.label || block.name}</Text>
                    <Text style={styles.gridSubtext}>{(block.area_hectares || 0).toFixed(1)} ha</Text>
                  </Surface>
                </TouchableOpacity>
              ))}
            </View>
          </List.Section>
        )}

        {sectors.length === 0 && standaloneBlocks.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge">{t('no_fields')}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingBottom: 24,
  },
  sectionTitle: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: 'bold',
    color: '#999',
  },
  sectorCard: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    backgroundColor: '#FFF',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  sectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingLeft: 12,
  },
  headerPressArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  folderIcon: {
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
    paddingRight: 8,
  },
  sectorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  sectorMetadata: {
    fontSize: 12,
    color: '#666',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    backgroundColor: '#F9F9F9',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  gridItem: {
    width: '33.33%',
    padding: 6,
  },
  tile: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  gridText: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
    textAlign: 'center',
    color: '#333',
  },
  gridSubtext: {
    fontSize: 10,
    color: '#999',
  },
  standaloneItem: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    elevation: 1,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
});
