import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { List, FAB, Title, IconButton, Divider } from 'react-native-paper';
import { useResourcesStore } from '../../store/useResourcesStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const ResourceTypesScreen = ({ navigation }: any) => {
  const { resourceTypes, fetchResourceTypes, loading } = useResourcesStore();

  useEffect(() => {
    fetchResourceTypes();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={resourceTypes}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <List.Item
            title={item.name}
            description={`Unit: ${item.unit} | Alert threshold: ${item.low_stock_threshold}`}
            left={props => (
              <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
                <MaterialCommunityIcons name={item.icon as any} size={24} color={item.color} />
              </View>
            )}
            right={props => <IconButton icon="pencil-outline" onPress={() => {}} />}
          />
        )}
        ItemSeparatorComponent={Divider}
      />
      
      <FAB
        icon="plus"
        label="New Type"
        style={styles.fab}
        onPress={() => {}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  list: {
    paddingBottom: 80,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
  },
});
