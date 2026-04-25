import React, { useState, useMemo } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity } from 'react-native';
import { Searchbar, Text, Surface, Divider } from 'react-native-paper';
import { Field } from '../types';
import { Colors } from '../utils/colorPalette';
import { useLanguageStore } from '../store/useLanguageStore';

interface FieldSearchProps {
  fields: Field[];
  onFieldSelect: (field: Field) => void;
  placeholder?: string;
  containerStyle?: any;
}

export const FieldSearch: React.FC<FieldSearchProps> = ({ 
  fields, 
  onFieldSelect, 
  placeholder,
  containerStyle 
}) => {
  const { t } = useLanguageStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  const filteredFields = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return fields.filter(field => 
      field.name.toLowerCase().includes(query) || 
      (field.label && field.label.toLowerCase().includes(query))
    ).slice(0, 5); // Limit results for performance and UI
  }, [searchQuery, fields]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setShowResults(query.length > 0);
  };

  const handleSelect = (field: Field) => {
    setSearchQuery('');
    setShowResults(false);
    onFieldSelect(field);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Searchbar
        placeholder={placeholder || t('search_fields') || "Search fields..."}
        onChangeText={handleSearchChange}
        value={searchQuery}
        style={styles.searchbar}
        inputStyle={styles.input}
        onClearIconPress={() => setShowResults(false)}
        iconColor={Colors.primary}
        placeholderTextColor={Colors.placeholder}
      />
      
      {showResults && filteredFields.length > 0 && (
        <Surface style={styles.resultsContainer} elevation={4}>
          <FlatList
            data={filteredFields}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.resultItem} 
                onPress={() => handleSelect(item)}
              >
                <View>
                  <Text style={styles.fieldName}>{item.name}</Text>
                  <Text style={styles.fieldType}>
                    {t(item.field_type)} • {item.area_hectares.toFixed(2)} ha
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <Divider />}
            keyboardShouldPersistTaps="handled"
          />
        </Surface>
      )}
      
      {showResults && searchQuery.length > 0 && filteredFields.length === 0 && (
        <Surface style={styles.resultsContainer} elevation={2}>
          <View style={styles.noResults}>
            <Text style={styles.noResultsText}>{t('no_results_found') || "No results found"}</Text>
          </View>
        </Surface>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 1000,
    width: '94%',
    alignSelf: 'center',
  },
  searchbar: {
    backgroundColor: '#FFF',
    borderRadius: 28,
    height: 52,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 0,
  },
  input: {
    fontSize: 16,
    color: Colors.text,
    minHeight: 0,
  },
  resultsContainer: {
    position: 'absolute',
    top: 60,
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    maxHeight: 300,
    overflow: 'hidden',
    zIndex: 1001,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  resultItem: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldName: {
    fontWeight: '600',
    fontSize: 16,
    color: Colors.text,
  },
  fieldType: {
    fontSize: 13,
    color: Colors.secondary,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  noResults: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    color: Colors.secondary,
    fontStyle: 'italic',
  },
});
