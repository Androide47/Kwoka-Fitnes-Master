import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronDown, ChevronUp, Mail, Globe } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useGlobalStyles } from '@/hooks/use-themed-styles';
import { useAppColors } from '@/hooks/use-app-colors';
import type { AppColors } from '@/constants/color-palettes';
import { useLanguageStore } from '@/store/language-store';
import { SUPPORT_EMAIL, HELP_WEB_URL } from '@/constants/support';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.md,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    backButton: {
      width: 'auto',
      marginRight: theme.spacing.md,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    faqItem: {
      marginBottom: theme.spacing.sm,
    },
    faqHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
    },
    faqQ: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    faqA: {
      fontSize: 15,
      color: colors.textSecondary,
      lineHeight: 22,
      paddingBottom: theme.spacing.md,
    },
    actions: {
      marginTop: theme.spacing.lg,
      gap: theme.spacing.md,
    },
  });
}

const FAQ_KEYS: { q: string; a: string }[] = [
  { q: 'settings.faq1q', a: 'settings.faq1a' },
  { q: 'settings.faq2q', a: 'settings.faq2a' },
  { q: 'settings.faq3q', a: 'settings.faq3a' },
];

export default function HelpSettingsScreen() {
  const router = useRouter();
  const { t } = useLanguageStore();
  const globalStyles = useGlobalStyles();
  const colors = useAppColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <SafeAreaView style={globalStyles.container}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Button
            title={t('settings.back')}
            onPress={() => router.back()}
            variant="text"
            style={styles.backButton}
          />
          <Text style={styles.title}>{t('settings.help')}</Text>
        </View>

        <Card>
          {FAQ_KEYS.map((item, index) => {
            const open = openIndex === index;
            return (
              <View key={item.q} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.faqHeader}
                  onPress={() => setOpenIndex(open ? null : index)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.faqQ}>{t(item.q)}</Text>
                  {open ? (
                    <ChevronUp size={22} color={colors.textSecondary} />
                  ) : (
                    <ChevronDown size={22} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
                {open ? <Text style={styles.faqA}>{t(item.a)}</Text> : null}
              </View>
            );
          })}
        </Card>

        <View style={styles.actions}>
          <Button
            title={t('settings.helpContact')}
            onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
            variant="outline"
            icon={<Mail size={20} color={colors.primary} />}
          />
          <Button
            title={t('settings.helpWebsite')}
            onPress={() => Linking.openURL(HELP_WEB_URL)}
            variant="outline"
            icon={<Globe size={20} color={colors.primary} />}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
