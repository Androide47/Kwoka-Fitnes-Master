import React, { createElement, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { Locate, MapPin } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-colors';
import type { AppColors } from '@/constants/color-palettes';
import { useLanguageStore } from '@/store/language-store';
import { Input } from '@/components/Input';
import {
  osmEmbedUrl,
  reverseGeocode,
  searchAddresses,
  type AddressSuggestion,
} from '@/utils/address-search';

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    wrap: {
      marginTop: theme.spacing.sm,
    },
    suggestions: {
      marginTop: 4,
      backgroundColor: colors.card,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    suggestionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    suggestionText: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
    },
    helperText: {
      fontSize: 13,
      color: colors.textSecondary,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    mapWrap: {
      marginTop: theme.spacing.sm,
      height: 180,
      borderRadius: theme.borderRadius.md,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
    },
  });
}

function MapPreview({ lat, lon }: { lat: number; lon: number }) {
  const url = osmEmbedUrl(lat, lon);

  if (Platform.OS === 'web') {
    return createElement('iframe', {
      src: url,
      title: 'Session location',
      style: {
        width: '100%',
        height: '100%',
        border: 0,
      },
    });
  }

  return (
    <WebView
      source={{ uri: url }}
      style={{ flex: 1, backgroundColor: 'transparent' }}
      scrollEnabled={false}
    />
  );
}

interface AddressSelectProps {
  value: string;
  onChange: (address: string) => void;
}

export const AddressSelect: React.FC<AddressSelectProps> = ({ value, onChange }) => {
  const colors = useAppColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const language = useLanguageStore(s => s.language);
  const t = useLanguageStore(s => s.t);

  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [selected, setSelected] = useState<AddressSuggestion | null>(null);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const skipSearchRef = useRef(false);

  useEffect(() => {
    if (value !== query && value !== selected?.label) {
      setQuery(value);
    }
  }, [value]);

  useEffect(() => {
    if (skipSearchRef.current) {
      skipSearchRef.current = false;
      return;
    }

    const q = query.trim();
    if (q.length < 3 || (selected && q === selected.label)) {
      setSuggestions([]);
      setSearching(false);
      return;
    }

    let cancelled = false;
    setSearching(true);
    const handle = setTimeout(() => {
      searchAddresses(q, language)
        .then(results => {
          if (!cancelled) setSuggestions(results);
        })
        .catch(() => {
          if (!cancelled) setSuggestions([]);
        })
        .finally(() => {
          if (!cancelled) setSearching(false);
        });
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query, language, selected]);

  const applySuggestion = (suggestion: AddressSuggestion) => {
    skipSearchRef.current = true;
    setSelected(suggestion);
    setQuery(suggestion.label);
    onChange(suggestion.label);
    setSuggestions([]);
    setSearching(false);
  };

  const handleChangeText = (text: string) => {
    setQuery(text);
    onChange(text);
    if (selected && text !== selected.label) {
      setSelected(null);
    }
  };

  const handleUseCurrentLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('common.error'), t('calendar.locationPermissionDenied'));
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const place = await reverseGeocode(
        position.coords.latitude,
        position.coords.longitude,
        language,
      );
      if (place) applySuggestion(place);
    } catch {
      Alert.alert(t('common.error'), t('calendar.locationLookupFailed'));
    } finally {
      setLocating(false);
    }
  };

  const showNoResults = query.trim().length >= 3 && !searching && !selected && suggestions.length === 0;

  return (
    <View style={styles.wrap}>
      <Input
        placeholder={t('calendar.locationPlaceholder')}
        value={query}
        onChangeText={handleChangeText}
        autoCorrect={false}
        autoCapitalize="words"
        containerStyle={{ marginBottom: 0 }}
        leftIcon={<MapPin size={20} color={colors.textSecondary} />}
        rightIcon={
          locating ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <TouchableOpacity
              onPress={handleUseCurrentLocation}
              accessibilityRole="button"
              accessibilityLabel={t('calendar.useCurrentLocation')}
              hitSlop={8}
            >
              <Locate size={20} color={colors.primary} />
            </TouchableOpacity>
          )
        }
      />

      {(searching || suggestions.length > 0 || showNoResults) && (
        <View style={styles.suggestions}>
          {searching && suggestions.length === 0 ? (
            <Text style={styles.helperText}>{t('calendar.searchingAddresses')}</Text>
          ) : showNoResults ? (
            <Text style={styles.helperText}>{t('calendar.noAddressResults')}</Text>
          ) : (
            suggestions.map(item => (
              <TouchableOpacity
                key={`${item.lat},${item.lon},${item.label}`}
                style={styles.suggestionRow}
                onPress={() => applySuggestion(item)}
              >
                <MapPin size={16} color={colors.primary} />
                <Text style={styles.suggestionText}>{item.label}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}

      {selected && (
        <View style={styles.mapWrap}>
          <MapPreview lat={selected.lat} lon={selected.lon} />
        </View>
      )}
    </View>
  );
};
