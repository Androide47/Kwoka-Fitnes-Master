import React, { useState, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Dumbbell, BarChart, MessageCircle, Calendar } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useGlobalStyles } from '@/hooks/use-themed-styles';
import { useAppColors } from '@/hooks/use-app-colors';
import type { AppColors } from '@/constants/color-palettes';
import { Button } from '@/components/Button';
import { useLanguageStore } from '@/store/language-store';

const { width } = Dimensions.get('window');

type SlideType = 'dumbbell' | 'bar' | 'message' | 'calendar';

const SLIDE_DEFS: {
  id: string;
  type: SlideType;
  titleKey: string;
  descriptionKey: string;
  image: string;
}[] = [
  {
    id: '1',
    type: 'dumbbell',
    titleKey: 'onboarding.slide1Title',
    descriptionKey: 'onboarding.slide1Description',
    image:
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  },
  {
    id: '2',
    type: 'bar',
    titleKey: 'onboarding.slide2Title',
    descriptionKey: 'onboarding.slide2Description',
    image:
      'https://images.unsplash.com/photo-1594882645126-14020914d58d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  },
  {
    id: '3',
    type: 'message',
    titleKey: 'onboarding.slide3Title',
    descriptionKey: 'onboarding.slide3Description',
    image:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  },
  {
    id: '4',
    type: 'calendar',
    titleKey: 'onboarding.slide4Title',
    descriptionKey: 'onboarding.slide4Description',
    image:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  },
];

function slideIcon(type: SlideType, color: string) {
  switch (type) {
    case 'dumbbell':
      return <Dumbbell size={40} color={color} />;
    case 'bar':
      return <BarChart size={40} color={color} />;
    case 'message':
      return <MessageCircle size={40} color={color} />;
    case 'calendar':
      return <Calendar size={40} color={color} />;
  }
}

function createOnboardingStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
    },
    appName: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.primary,
    },
    skipText: {
      fontSize: 16,
      color: colors.primary,
    },
    slide: {
      width,
      alignItems: 'center',
    },
    imageContainer: {
      width: width,
      height: width * 0.8,
      position: 'relative',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    iconOverlay: {
      position: 'absolute',
      bottom: -30,
      alignSelf: 'center',
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.card,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.medium,
    },
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.xl,
      alignItems: 'center',
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginBottom: theme.spacing.md,
      textAlign: 'center',
    },
    description: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
    pagination: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: theme.spacing.lg,
    },
    dot: {
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
      marginHorizontal: 4,
    },
    activeDot: {
      backgroundColor: colors.primary,
    },
    footer: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
    },
    button: {
      width: '100%',
    },
  });
}

export default function OnboardingScreen() {
  const router = useRouter();
  const globalStyles = useGlobalStyles();
  const colors = useAppColors();
  const styles = useMemo(() => createOnboardingStyles(colors), [colors]);
  const language = useLanguageStore((s) => s.language);
  const t = useLanguageStore((s) => s.t);
  const onboardingData = useMemo(
    () =>
      SLIDE_DEFS.map((s) => ({
        id: s.id,
        type: s.type,
        image: s.image,
        title: t(s.titleKey),
        description: t(s.descriptionKey),
        icon: slideIcon(s.type, colors.primary),
      })),
    [colors.primary, language, t],
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
      setCurrentIndex(currentIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    router.replace('/login');
  };

  const handleScroll = Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
    useNativeDriver: false,
  });

  const handleViewableItemsChanged = ({ viewableItems }: { viewableItems: { index: number | null }[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      setCurrentIndex(viewableItems[0].index);
    }
  };

  const renderItem = ({ item }: { item: (typeof onboardingData)[0] }) => (
    <View style={styles.slide}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.image} contentFit="cover" />
        <View style={styles.iconOverlay}>{item.icon}</View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  const renderDots = () => {
    return (
      <View style={styles.pagination}>
        {onboardingData.map((_, index) => {
          const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 16, 8],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[styles.dot, { width: dotWidth, opacity }, index === currentIndex && styles.activeDot]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.appName}>{t('app.name')}</Text>
          {currentIndex < onboardingData.length - 1 && (
            <TouchableOpacity onPress={handleFinish}>
              <Text style={styles.skipText}>{t('common.skip')}</Text>
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          ref={flatListRef}
          data={onboardingData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          onViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
          scrollEventThrottle={16}
        />

        {renderDots()}

        <View style={styles.footer}>
          <Button
            title={currentIndex === onboardingData.length - 1 ? t('home.getStarted') : t('common.next')}
            onPress={handleNext}
            style={styles.button}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
