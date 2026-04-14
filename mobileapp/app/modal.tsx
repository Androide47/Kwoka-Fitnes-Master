import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useLanguageStore } from '@/store/language-store';

export default function ModalScreen() {
  const t = useLanguageStore((s) => s.t);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('modal.exampleTitle')}</Text>
      <View style={styles.separator} />
      <Text>{t('modal.exampleBody')}</Text>

      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
