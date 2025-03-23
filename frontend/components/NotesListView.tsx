import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

// Interface for notes data with categories
interface NotesData {
  [category: string]: string[];
}

interface NotesListViewProps {
  notesData: NotesData;
}

export default function NotesListView({ notesData }: NotesListViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Get all categories from the notes data
  const categories = Object.keys(notesData);
  
  // If we have categories but no selection, default to the first one
  React.useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);
  
  // Calculate total notes count
  const totalNotes = Object.values(notesData).reduce(
    (sum, notes) => sum + notes.length, 
    0
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Class Notes</Text>
        {totalNotes > 0 && (
          <Text style={styles.noteCount}>
            {totalNotes} note{totalNotes !== 1 ? 's' : ''} in {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}
          </Text>
        )}
      </View>
      
      {totalNotes === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyStateText}>
            No notes yet. Share your class notes in the chat to automatically organize them into categories.
          </Text>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          {/* Categories sidebar */}
          <View style={styles.categoriesContainer}>
            <Text style={styles.subtitle}>Categories</Text>
            <ScrollView style={styles.categoryList}>
              {categories.map((category, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[
                    styles.categoryItem,
                    selectedCategory === category && styles.selectedCategory
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text 
                    style={[
                      styles.categoryText,
                      selectedCategory === category && styles.selectedCategoryText
                    ]}
                  >
                    {category}
                  </Text>
                  <View style={styles.noteBadge}>
                    <Text style={styles.noteBadgeText}>
                      {notesData[category].length}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          {/* Notes for selected category */}
          <View style={styles.notesContainer}>
            {selectedCategory ? (
              <>
                <Text style={styles.categoryTitle}>{selectedCategory}</Text>
                <ScrollView style={styles.notesList}>
                  {notesData[selectedCategory]?.map((note, index) => (
                    <View key={index} style={styles.noteCard}>
                      <Text style={styles.noteItem}>
                        {note}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </>
            ) : (
              <Text style={styles.emptyStateText}>
                Select a category to view notes
              </Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  noteCount: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  categoriesContainer: {
    width: '40%',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    paddingRight: 8,
  },
  categoryList: {
    flex: 1,
  },
  notesContainer: {
    flex: 1,
    paddingLeft: 12,
  },
  notesList: {
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  categoryTitle: {
    fontSize: 18,
    marginBottom: 12,
    fontWeight: '600',
    color: '#333',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: '#f5f5f5',
  },
  selectedCategory: {
    backgroundColor: '#d0ebff',
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#444',
    flex: 1,
  },
  selectedCategoryText: {
    color: '#0d47a1',
    fontWeight: '600',
  },
  noteBadge: {
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  noteBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#616161',
  },
  noteCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  noteItem: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#777',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 20,
  },
});
