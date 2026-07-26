import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Platform,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Lock, Mail, Facebook, Instagram } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useGlobalStyles } from '@/hooks/use-themed-styles';
import { useAppColors } from '@/hooks/use-app-colors';
import type { AppColors } from '@/constants/color-palettes';
import { useAuthStore } from '@/store/auth-store';
import { useLanguageStore } from '@/store/language-store';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { appPush, appReplace } from '@/utils/navigation';

const LOGO = require('@/assets/images/IsoWhite.png');

function createStyles(colors: AppColors, logoWidth: number) {
  return StyleSheet.create({
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: theme.spacing.md,
      paddingVertical: theme.spacing.xl,
    },
    header: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
      width: '100%',
    },
    logoImage: {
      width: logoWidth,
      height: logoWidth * (1106 / 2901),
      borderRadius: theme.borderRadius.md,
    },
    formContainer: {
      marginBottom: theme.spacing.xl,
    },
    loginButton: {
      marginTop: theme.spacing.md,
    },
    signUpButton: {
      marginTop: theme.spacing.md,
    },
    errorText: {
      color: colors.error,
      fontSize: 14,
      marginTop: theme.spacing.sm,
      textAlign: 'center',
    },
    switchContainer: {
      marginTop: theme.spacing.lg,
      alignItems: 'center',
    },
    switchLabel: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: theme.spacing.sm,
    },
    switchWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.backgroundLight,
      borderRadius: theme.borderRadius.round,
      padding: theme.spacing.xs,
    },
    switch: {
      marginHorizontal: theme.spacing.xs,
    },
    switchOption: {
      fontSize: 14,
      color: colors.textSecondary,
      paddingHorizontal: theme.spacing.sm,
    },
    switchOptionActive: {
      color: colors.primary,
      fontWeight: '600',
    },
    socialLoginContainer: {
      marginTop: theme.spacing.lg,
    },
    socialLoginText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
    socialButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    socialButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      flex: 0.48,
      gap: theme.spacing.sm,
    },
    facebookButton: {
      backgroundColor: '#1877F2',
    },
    instagramButton: {
      backgroundColor: '#E1306C',
    },
    socialButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: 14,
    },
    quickLoginContainer: {
      marginTop: theme.spacing.lg,
      alignItems: 'center',
    },
    quickLoginLink: {
      padding: theme.spacing.sm,
    },
    quickLoginText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '600',
    },
  });
}

export default function LoginScreen() {
  const { width } = useWindowDimensions();
  const { login } = useAuthStore();
  const { t } = useLanguageStore();
  const globalStyles = useGlobalStyles();
  const colors = useAppColors();
  const logoWidth = Math.max(Math.min(width - theme.spacing.md * 2, 480), 200);
  const styles = useMemo(() => createStyles(colors, logoWidth), [colors, logoWidth]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isClientMode, setIsClientMode] = useState(true);

  const goHome = () => appReplace('/(tabs)');

  const handleLogin = async () => {
    if (!email || !password) {
      setError(t('auth.invalidCredentials'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const success = await login(email, password);

      if (success) {
        goHome();
      } else {
        setError(t('auth.invalidCredentials'));
      }
    } catch (err) {
      setError(t('auth.loginError'));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (userType: 'trainer' | 'client') => {
    setIsLoading(true);
    setError('');

    try {
      const loginEmail = userType === 'trainer' ? 'trainer@example.com' : 'client@example.com';
      const success = await login(loginEmail, 'password');

      if (success) {
        goHome();
      } else {
        setError(t('auth.invalidCredentials'));
      }
    } catch (err) {
      setError(t('auth.loginError'));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    appPush('/signup');
  };

  const handleSocialLogin = (platform: string) => {
    setError('');
    console.log(`Login with ${platform}`);
    handleQuickLogin('client');
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={Platform.OS === 'web'}
      >
        <View style={styles.header}>
          <Image
            source={LOGO}
            style={styles.logoImage}
            contentFit="contain"
            accessibilityLabel="Kwoka Fitness"
          />
        </View>

        <View style={styles.formContainer}>
          <Input
            label={t('auth.email')}
            placeholder={t('auth.enterEmail')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={20} color={colors.textSecondary} />}
          />

          <Input
            label={t('auth.password')}
            placeholder={t('auth.enterPassword')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            leftIcon={<Lock size={20} color={colors.textSecondary} />}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Button title={t('auth.login')} onPress={handleLogin} loading={isLoading} style={styles.loginButton} />

          <Button
            title={t('auth.signUp')}
            onPress={handleSignUp}
            variant="outline"
            style={styles.signUpButton}
            disabled={isLoading}
          />

          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>{t('auth.accountType')}</Text>
            <View style={styles.switchWrapper}>
              <Text style={[styles.switchOption, !isClientMode && styles.switchOptionActive]}>
                {t('auth.trainer')}
              </Text>

              <Switch
                value={isClientMode}
                onValueChange={setIsClientMode}
                trackColor={{ false: colors.primary, true: colors.primary }}
                thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : colors.text}
                ios_backgroundColor={colors.backgroundLight}
                style={styles.switch}
              />

              <Text style={[styles.switchOption, isClientMode && styles.switchOptionActive]}>
                {t('auth.client')}
              </Text>
            </View>
          </View>

          {isClientMode && (
            <View style={styles.socialLoginContainer}>
              <Text style={styles.socialLoginText}>{t('auth.continueWith')}</Text>

              <View style={styles.socialButtons}>
                <TouchableOpacity
                  style={[styles.socialButton, styles.facebookButton]}
                  onPress={() => handleSocialLogin('Facebook')}
                  disabled={isLoading}
                >
                  <Facebook size={24} color="#FFFFFF" />
                  <Text style={styles.socialButtonText}>{t('auth.facebook')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.socialButton, styles.instagramButton]}
                  onPress={() => handleSocialLogin('Instagram')}
                  disabled={isLoading}
                >
                  <Instagram size={24} color="#FFFFFF" />
                  <Text style={styles.socialButtonText}>{t('auth.instagram')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.quickLoginContainer}>
            <TouchableOpacity
              style={styles.quickLoginLink}
              onPress={() => handleQuickLogin(isClientMode ? 'client' : 'trainer')}
              disabled={isLoading}
            >
              <Text style={styles.quickLoginText}>
                {t('auth.quickLoginAs')} {isClientMode ? t('auth.client') : t('auth.trainer')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
