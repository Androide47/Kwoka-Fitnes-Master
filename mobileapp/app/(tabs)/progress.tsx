import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, type Href } from 'expo-router';
import { Camera, FileText, Plus, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useAppColors } from '@/hooks/use-app-colors';
import { useGlobalStyles } from '@/hooks/use-themed-styles';
import { createProgressTabStyles } from '@/utils/progress-tab-styles';
import { useProgressStore } from '@/store/progress-store';
import { useAuthStore } from '@/store/auth-store';
import { ProgressCard } from '@/components/ProgressCard';
import { ProgressEntry } from '@/types';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function ProgressScreen() {
  const router = useRouter();
  const { user, isTrainer, clients } = useAuthStore();
  const { getEntries } = useProgressStore();
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'photos' | 'measurements' | 'notes'>('all');
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const colors = useAppColors();
  const globalStyles = useGlobalStyles();
  const styles = useMemo(() => createProgressTabStyles(colors), [colors]);

  if (!user) return null;
  
  const clientId = isTrainer ? (selectedClient || (clients[0]?.id || '')) : user.id;
  const allEntries = getEntries(clientId);
  
  const filteredEntries = activeTab === 'all' 
    ? allEntries 
    : allEntries.filter(entry => {
        if (activeTab === 'photos') return entry.type === 'photo';
        if (activeTab === 'measurements') return entry.type === 'measurement';
        if (activeTab === 'notes') return entry.type === 'note';
        return true;
      });

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    filteredEntries.forEach(entry => years.add(new Date(entry.date).getFullYear()));
    years.add(currentYear);
    return Array.from(years).sort((a, b) => b - a);
  }, [filteredEntries, currentYear]);

  const entriesByYear = filteredEntries.filter(entry => new Date(entry.date).getFullYear() === selectedYear);

  const entriesByMonth = useMemo(() => {
    const grouped = new Map<number, ProgressEntry[]>();
    entriesByYear.forEach(entry => {
      const month = new Date(entry.date).getMonth();
      if (!grouped.has(month)) grouped.set(month, []);
      grouped.get(month)!.push(entry);
    });
    return Array.from(grouped.entries())
      .sort(([a], [b]) => b - a)
      .map(([month, entries]) => ({
        month,
        monthName: MONTH_NAMES[month],
        entries: entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      }));
  }, [entriesByYear]);
  
  const renderClientSelector = () => (
    <View style={styles.clientSelector}>
      <Text style={styles.clientSelectorTitle}>Select Client:</Text>
      <FlatList
        data={clients}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.clientItem,
              selectedClient === item.id && styles.clientItemSelected
            ]}
            onPress={() => setSelectedClient(item.id)}
          >
            <Text style={[
              styles.clientItemText,
              selectedClient === item.id && styles.clientItemTextSelected
            ]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.clientList}
      />
    </View>
  );
  
  const currentYearIndex = availableYears.indexOf(selectedYear);
  const hasPrevYear = currentYearIndex >= 0 && currentYearIndex < availableYears.length - 1;
  const hasNextYear = currentYearIndex > 0;

  const renderYearSelector = () => (
    <View style={styles.yearSelector}>
      <TouchableOpacity
        style={styles.yearButton}
        onPress={() => hasPrevYear && setSelectedYear(availableYears[currentYearIndex + 1])}
        disabled={!hasPrevYear}
      >
        <ChevronLeft size={24} color={hasPrevYear ? colors.text : colors.inactive} />
      </TouchableOpacity>
      <Text style={styles.yearText}>{selectedYear}</Text>
      <TouchableOpacity
        style={styles.yearButton}
        onPress={() => hasNextYear && setSelectedYear(availableYears[currentYearIndex - 1])}
        disabled={!hasNextYear}
      >
        <ChevronRight size={24} color={hasNextYear ? colors.text : colors.inactive} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={styles.container}>
        {isTrainer && renderClientSelector()}
        
        {renderYearSelector()}
        
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' && styles.activeTab]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>All</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'photos' && styles.activeTab]}
            onPress={() => setActiveTab('photos')}
          >
            <Camera size={16} color={activeTab === 'photos' ? colors.text : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'photos' && styles.activeTabText]}>Photos</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'measurements' && styles.activeTab]}
            onPress={() => setActiveTab('measurements')}
          >
            <FileText size={16} color={activeTab === 'measurements' ? colors.text : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'measurements' && styles.activeTabText]}>Measurements</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'notes' && styles.activeTab]}
            onPress={() => setActiveTab('notes')}
          >
            <FileText size={16} color={activeTab === 'notes' ? colors.text : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'notes' && styles.activeTabText]}>Notes</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={entriesByMonth}
          keyExtractor={(item) => `month-${item.month}`}
          renderItem={({ item }) => (
            <View style={styles.monthSection}>
              <Text style={styles.monthTitle}>{item.monthName}</Text>
              <View style={styles.monthDivider} />
              {item.entries.map((entry) => (
                <ProgressCard
                  key={entry.id}
                  entry={entry}
                  onPress={() => router.push(`/progress/${entry.id}` as Href)}
                />
              ))}
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No progress entries found for {selectedYear}</Text>
            </View>
          }
        />
        
        {!isTrainer && (
          <View style={styles.fabContainer}>
            <TouchableOpacity
              style={[styles.fab, { backgroundColor: colors.secondary }]}
              onPress={() => router.push('/progress/photo')}
            >
              <Camera size={24} color={colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.fab, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/progress/measurement')}
            >
              <FileText size={24} color={colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.fab, { backgroundColor: '#4CAF50' }]}
              onPress={() => router.push('/progress/note')}
            >
              <Plus size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
