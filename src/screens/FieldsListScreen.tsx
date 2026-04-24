import React, { useEffect } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Title, Text, Searchbar } from 'react-native-paper';
import { useFieldsStore } from '../store/useFieldsStore';
import { FieldCard } from '../components/FieldCard';
import { Colors } from '../utils/colorPalette';

export const FieldsListScreen = ({ navigation }: any) => {
  const { fields, loading, fetchFields } = useFieldsStore();
  const [searchQuery, setSearchQuery] = React.useState('');

  useEffect(() => {
    fetchFields();
  }, []);

  const filteredFields = fields.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && fields.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search fields"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />
      <FlatList
        data={filteredFields}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FieldCard
            field={item}
            onPress={() => navigation.navigate('FieldDetail', { fieldId: item.id })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text>No fields found. Add one on the map!</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchbar: {
    margin: 16,
    elevation: 2,
    backgroundColor: '#FFF',
  },
  listContent: {
    paddingBottom: 24,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
});
