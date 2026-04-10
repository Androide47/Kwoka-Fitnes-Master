import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { Play, Pause, RotateCcw } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-colors';
import type { AppColors } from '@/constants/color-palettes';

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      marginVertical: theme.spacing.md,
    },
    timerContainer: {
      backgroundColor: colors.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      alignItems: 'center',
      ...theme.shadows.small,
    },
    progressContainer: {
      width: '100%',
      height: 4,
      backgroundColor: colors.backgroundLight,
      borderRadius: 2,
      marginBottom: theme.spacing.md,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      backgroundColor: colors.primary,
    },
    timerText: {
      fontSize: 48,
      fontWeight: '700',
      color: colors.text,
      marginBottom: theme.spacing.md,
    },
    controls: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    controlButton: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    compactContainer: {
      backgroundColor: colors.backgroundLight,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
    compactProgress: {
      width: '100%',
      height: 3,
      backgroundColor: colors.border,
      borderRadius: 1.5,
      marginBottom: 6,
      overflow: 'hidden',
    },
    compactRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    compactTimerText: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      minWidth: 56,
    },
    compactBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
}

interface TimerProps {
  initialSeconds?: number;
  onComplete?: () => void;
  autoStart?: boolean;
  countDown?: boolean;
  compact?: boolean;
}

export const Timer: React.FC<TimerProps> = ({
  initialSeconds = 60,
  onComplete,
  autoStart = false,
  countDown = true,
  compact = false,
}) => {
  const colors = useAppColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(autoStart);
  const [isCompleted, setIsCompleted] = useState(false);

  const progressAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isActive && !isCompleted) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => {
          const newSeconds = countDown ? prevSeconds - 1 : prevSeconds + 1;

          if (countDown && newSeconds <= 0) {
            if (interval) clearInterval(interval);
            setIsActive(false);
            setIsCompleted(true);
            onComplete?.();
            return 0;
          }

          return newSeconds;
        });
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isCompleted, countDown, onComplete]);

  useEffect(() => {
    if (countDown) {
      Animated.timing(progressAnimation, {
        toValue: isActive ? 1 : 0,
        duration: isActive ? seconds * 1000 : 300,
        useNativeDriver: false,
        easing: Easing.linear,
      }).start();
    }
  }, [isActive, seconds, countDown, progressAnimation]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    if (isCompleted) {
      resetTimer();
    } else {
      setIsActive(!isActive);
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsCompleted(false);
    setSeconds(initialSeconds);
    progressAnimation.setValue(0);
  };

  const progressInterpolation = progressAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        {countDown && (
          <View style={styles.compactProgress}>
            <Animated.View style={[styles.progressBar, { width: progressInterpolation }]} />
          </View>
        )}
        <View style={styles.compactRow}>
          <Text style={styles.compactTimerText}>{formatTime(seconds)}</Text>
          <TouchableOpacity style={styles.compactBtn} onPress={toggleTimer}>
            {isActive ? (
              <Pause size={16} color={colors.text} />
            ) : (
              <Play size={16} color={colors.text} />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.compactBtn} onPress={resetTimer}>
            <RotateCcw size={16} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.timerContainer}>
        {countDown && (
          <View style={styles.progressContainer}>
            <Animated.View style={[styles.progressBar, { width: progressInterpolation }]} />
          </View>
        )}

        <Text style={styles.timerText}>{formatTime(seconds)}</Text>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton} onPress={toggleTimer}>
            {isActive ? (
              <Pause size={24} color={colors.text} />
            ) : (
              <Play size={24} color={colors.text} />
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={resetTimer}>
            <RotateCcw size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
