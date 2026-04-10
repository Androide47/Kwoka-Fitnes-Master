import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity, Alert, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Play, Clock, Dumbbell, BarChart3, CheckCircle, Award, RotateCcw } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-colors';
import { useGlobalStyles } from '@/hooks/use-themed-styles';
import { createWorkoutDetailStyles } from '@/utils/workout-detail-styles';
import { useWorkoutStore } from '@/store/workout-store';
import { useAuthStore } from '@/store/auth-store';
import { useLanguageStore } from '@/store/language-store';
import { groupExercises, ExerciseGroup } from '@/utils/workout-utils';
import { ExerciseCard } from '@/components/ExerciseCard';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Timer } from '@/components/Timer';
import { Video, ResizeMode } from 'expo-av';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Confetti from '@/components/Confetti';
import { WebView } from 'react-native-webview';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - theme.spacing.md * 2;

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { 
    getWorkoutById, 
    getExerciseById, 
    startWorkout, 
    activeWorkout, 
    isWorkoutActive, 
    getCurrentExercise, 
    nextExercise, 
    updateExerciseNotes, 
    endWorkout,
    markExerciseCompleted,
    isExerciseCompleted,
    markWorkoutCompleted,
    isWorkoutCompleted,
    repeatWorkout,
    setActiveGroupIndex,
    activeGroupIndex,
  } = useWorkoutStore();
  const { isTrainer } = useAuthStore();
  const { t } = useLanguageStore();
  const colors = useAppColors();
  const globalStyles = useGlobalStyles();
  const styles = useMemo(() => createWorkoutDetailStyles(colors), [colors]);
  const getDifficultyColor = useCallback(
    (difficulty: string) => {
      switch (difficulty) {
        case 'beginner':
          return colors.success;
        case 'intermediate':
          return colors.warning;
        case 'advanced':
          return colors.error;
        default:
          return colors.textSecondary;
      }
    },
    [colors],
  );

  const [workout, setWorkout] = useState(getWorkoutById(id));
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [currentNote, setCurrentNote] = useState('');
  const [currentExerciseId, setCurrentExerciseId] = useState('');
  const [showVideo, setShowVideo] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  const [playingVideoExId, setPlayingVideoExId] = useState<string | null>(null);
  
  const videoRef = useRef(null);
  const groupFlatListRef = useRef<FlatList>(null);
  
  const groups = useMemo<ExerciseGroup[]>(
    () => (workout ? groupExercises(workout.exercises) : []),
    [workout],
  );
  
  useEffect(() => {
    if (!workout) {
      Alert.alert('Error', 'Workout not found');
      router.back();
    }
  }, [workout]);
  
  useEffect(() => {
    if (isWorkoutActive && activeWorkout?.id === id) {
      setCurrentGroupIndex(activeGroupIndex);
    }
  }, [isWorkoutActive, activeWorkout, activeGroupIndex]);
  
  const handleStartWorkout = () => {
    if (workout) {
      startWorkout(workout.id);
    }
  };
  
  const isAllGroupsCompleted = useCallback(() => {
    if (!workout) return false;
    const { completedExercises } = useWorkoutStore.getState();
    const completedIds = new Set(
      completedExercises
        .filter(ex => ex.workoutId === workout.id)
        .map(ex => ex.exerciseId),
    );
    return groups.every(group =>
      group.exercises.every(ex => completedIds.has(ex.exerciseId)),
    );
  }, [workout, groups]);
  
  const isGroupCompleted = useCallback((group: ExerciseGroup) => {
    if (!workout) return false;
    const { completedExercises } = useWorkoutStore.getState();
    const completedIds = new Set(
      completedExercises
        .filter(ex => ex.workoutId === workout.id)
        .map(ex => ex.exerciseId),
    );
    return group.exercises.every(ex => completedIds.has(ex.exerciseId));
  }, [workout]);
  
  const handleEndWorkout = () => {
    Alert.alert(
      t('workouts.endWorkout'),
      t('workouts.confirmEnd'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: 'End',
          onPress: () => {
            if (!workout) return;
            
            if (isAllGroupsCompleted()) {
              markWorkoutCompleted(workout.id);
              endWorkout();
              setShowConfetti(true);
              setShowCompletionMessage(true);
            } else {
              endWorkout();
              router.back();
            }
          },
        },
      ]
    );
  };
  
  const handleAddNote = (exerciseId: string, currentNoteText: string = '') => {
    setCurrentExerciseId(exerciseId);
    setCurrentNote(currentNoteText);
    setNoteModalVisible(true);
  };
  
  const handleSaveNote = () => {
    if (currentExerciseId) {
      updateExerciseNotes(currentExerciseId, currentNote);
      setNoteModalVisible(false);
      setCurrentNote('');
      setCurrentExerciseId('');
    }
  };
  
  const handlePlayVideo = (videoUrl: string) => {
    if (videoUrl) {
      setCurrentVideoUrl(videoUrl);
      setShowVideo(true);
    }
  };
  
  const handleCloseVideo = () => {
    setShowVideo(false);
    setCurrentVideoUrl('');
  };
  
  const toggleInlineVideo = (exerciseId: string) => {
    setPlayingVideoExId((prev) => (prev === exerciseId ? null : exerciseId));
  };
  
  const handleCompleteExercise = (exerciseId: string) => {
    if (!workout) return;
    
    markExerciseCompleted(workout.id, exerciseId);
    
    const { completedExercises } = useWorkoutStore.getState();
    const completedIds = new Set(
      completedExercises
        .filter(ex => ex.workoutId === workout.id)
        .map(ex => ex.exerciseId),
    );
    completedIds.add(exerciseId);
    
    const allDone = groups.every(g =>
      g.exercises.every(ex => completedIds.has(ex.exerciseId)),
    );
    
    if (allDone) {
      markWorkoutCompleted(workout.id);
      endWorkout();
      setShowConfetti(true);
      setShowCompletionMessage(true);
      return;
    }
    
    const currentGroup = groups[currentGroupIndex];
    const groupDone = currentGroup.exercises.every(ex =>
      completedIds.has(ex.exerciseId),
    );
    
    if (groupDone && currentGroupIndex < groups.length - 1) {
      const nextIdx = currentGroupIndex + 1;
      groupFlatListRef.current?.scrollToIndex({ index: nextIdx, animated: true });
      setCurrentGroupIndex(nextIdx);
      setActiveGroupIndex(nextIdx);
    }
  };
  
  const handleGroupViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: { index: number | null }[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        const idx = viewableItems[0].index;
        setCurrentGroupIndex(idx);
        setActiveGroupIndex(idx);
      }
    },
  ).current;
  
  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;
  
  if (!workout) return null;
  
  const renderWorkoutDetails = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>{workout.name}</Text>
        <View style={[
          styles.difficultyBadge, 
          { backgroundColor: getDifficultyColor(workout.difficulty) }
        ]}>
          <Text style={styles.difficultyText}>
            {t(`common.${workout.difficulty}`)}
          </Text>
        </View>
      </View>
      
      {!isTrainer && (
        <>
          <Button
            title={isWorkoutCompleted(workout.id) ? t('workouts.workoutCompleted') : t('workouts.startWorkout')}
            onPress={handleStartWorkout}
            style={StyleSheet.flatten([
              styles.startButton,
              isWorkoutCompleted(workout.id) ? (styles.completedButton as any) : {}
            ])}
            icon={isWorkoutCompleted(workout.id) ? 
              <CheckCircle size={20} color={colors.text} /> : 
              <Play size={20} color={colors.text} />
            }
            disabled={isWorkoutCompleted(workout.id)}
          />
          {isWorkoutCompleted(workout.id) && (
            <Button
              title={t('workouts.repeat')}
              onPress={() => {
                repeatWorkout(workout.id);
                handleStartWorkout();
              }}
              variant="outline"
              style={styles.repeatButton}
              icon={<RotateCcw size={20} color={colors.primary} />}
            />
          )}
        </>
      )}
      
      <Text style={styles.description}>{workout.description}</Text>
      
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Clock size={20} color={colors.textSecondary} />
          <Text style={styles.statText}>{workout.duration} min</Text>
        </View>
        
        <View style={styles.stat}>
          <Dumbbell size={20} color={colors.textSecondary} />
          <Text style={styles.statText}>{workout.exercises.length} exercises</Text>
        </View>
        
        <View style={styles.stat}>
          <BarChart3 size={20} color={colors.textSecondary} />
          <Text style={styles.statText}>
            {workout.exercises.reduce((total, ex) => total + (ex.sets || 0), 0)} sets
          </Text>
        </View>
      </View>
      
      <Text style={styles.sectionTitle}>{t('workouts.exercises')}</Text>
      
      {groups.map((group) => (
        <View key={group.label}>
          <View style={styles.detailGroupHeader}>
            <Text style={styles.detailGroupLabel}>Group {group.label}</Text>
            <Text style={styles.detailGroupCount}>{group.exercises.length} exercises</Text>
          </View>
          
          {group.exercises.map((workoutExercise) => {
            const exercise = getExerciseById(workoutExercise.exerciseId);
            if (!exercise) return null;
            
            const completed = isExerciseCompleted(workout.id, workoutExercise.exerciseId);
            const ytId = exercise.videoUrl ? extractYouTubeId(exercise.videoUrl) : null;
            const isPlaying = playingVideoExId === workoutExercise.exerciseId;
            
            return (
              <View key={workoutExercise.exerciseId} style={styles.exerciseBlock}>
                {ytId && !isPlaying && (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.videoThumbWrap}
                    onPress={() => toggleInlineVideo(workoutExercise.exerciseId)}
                  >
                    <Image
                      source={{ uri: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` }}
                      style={styles.videoThumbImage}
                    />
                    <View style={styles.videoPlayBadge}>
                      <Play size={20} color="#fff" fill="#fff" />
                    </View>
                  </TouchableOpacity>
                )}
                
                {ytId && isPlaying && (
                  <View style={styles.videoThumbWrap}>
                    <WebView
                      source={{
                        uri: `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&playsinline=1`,
                      }}
                      style={{ flex: 1 }}
                      allowsFullscreenVideo
                      allowsInlineMediaPlayback
                      mediaPlaybackRequiresUserAction={false}
                      javaScriptEnabled
                    />
                    <TouchableOpacity
                      style={styles.videoCloseBtn}
                      onPress={() => setPlayingVideoExId(null)}
                    >
                      <Text style={styles.videoCloseBtnText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                )}
                
                <View style={[styles.groupExerciseRow, completed && styles.groupExerciseRowDone]}>
                  <View style={styles.groupExerciseInfo}>
                    <Text style={[styles.groupExerciseName, completed && styles.groupExerciseNameDone]}>
                      {exercise.name}
                    </Text>
                    <Text style={styles.groupExerciseMeta}>
                      {workoutExercise.sets && workoutExercise.reps
                        ? `${workoutExercise.sets} sets × ${workoutExercise.reps} reps`
                        : workoutExercise.duration
                          ? `${workoutExercise.sets ?? 1} sets × ${formatDuration(workoutExercise.duration)}`
                          : ''}
                      {workoutExercise.weight ? ` • ${workoutExercise.weight} kg` : ''}
                    </Text>
                    {workoutExercise.notes && (
                      <Text style={styles.groupExerciseNotes} numberOfLines={2}>{workoutExercise.notes}</Text>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
  
  const renderGroupCard = ({ item: group, index: groupIdx }: { item: ExerciseGroup; index: number }) => {
    const groupDone = isGroupCompleted(group);
    
    return (
      <View style={[styles.groupCardContainer, { width: CARD_WIDTH }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.groupCardScroll}>
          <View style={styles.groupHeader}>
            <View style={styles.groupLabelBadge}>
              <Text style={styles.groupLabelText}>Group {group.label}</Text>
            </View>
            {groupDone && (
              <View style={styles.groupDoneBadge}>
                <CheckCircle size={14} color={colors.text} />
                <Text style={styles.groupDoneText}>Complete</Text>
              </View>
            )}
          </View>
          
          {group.exercises.map((we) => {
            const ex = getExerciseById(we.exerciseId);
            if (!ex) return null;
            const done = workout ? isExerciseCompleted(workout.id, we.exerciseId) : false;
            const ytId = ex.videoUrl ? extractYouTubeId(ex.videoUrl) : null;
            
            const isPlaying = playingVideoExId === we.exerciseId;
            
            return (
              <View key={we.exerciseId} style={styles.exerciseBlock}>
                {ytId && !isPlaying && (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.videoThumbWrap}
                    onPress={() => toggleInlineVideo(we.exerciseId)}
                  >
                    <Image
                      source={{ uri: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` }}
                      style={styles.videoThumbImage}
                    />
                    <View style={styles.videoPlayBadge}>
                      <Play size={20} color="#fff" fill="#fff" />
                    </View>
                  </TouchableOpacity>
                )}
                
                {ytId && isPlaying && (
                  <View style={styles.videoThumbWrap}>
                    <WebView
                      source={{
                        uri: `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&playsinline=1`,
                      }}
                      style={{ flex: 1 }}
                      allowsFullscreenVideo
                      allowsInlineMediaPlayback
                      mediaPlaybackRequiresUserAction={false}
                      javaScriptEnabled
                    />
                    <TouchableOpacity
                      style={styles.videoCloseBtn}
                      onPress={() => setPlayingVideoExId(null)}
                    >
                      <Text style={styles.videoCloseBtnText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                )}
                
                <View style={[styles.groupExerciseRow, done && styles.groupExerciseRowDone]}>
                  <View style={styles.groupExerciseInfo}>
                    <Text style={[styles.groupExerciseName, done && styles.groupExerciseNameDone]}>
                      {ex.name}
                    </Text>
                    <Text style={styles.groupExerciseMeta}>
                      {we.sets && we.reps
                        ? `${we.sets} sets × ${we.reps} reps`
                        : we.duration
                          ? `${we.sets ?? 1} sets × ${formatDuration(we.duration)}`
                          : ''}
                      {we.weight ? ` • ${we.weight} kg` : ''}
                    </Text>
                    {we.notes && (
                      <Text style={styles.groupExerciseNotes} numberOfLines={2}>{we.notes}</Text>
                    )}
                  </View>
                  
                  <TouchableOpacity
                    style={[styles.completeExBtn, done && styles.completeExBtnDone]}
                    onPress={() => !done && handleCompleteExercise(we.exerciseId)}
                    disabled={done}
                  >
                    <CheckCircle size={22} color={done ? colors.text : colors.success} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
          
          {group.exercises.some(we => we.restTime) && (
            <Timer
              initialSeconds={
                group.exercises.find(we => we.restTime)?.restTime ?? 60
              }
              countDown
              autoStart={false}
              compact
            />
          )}
          
          <View style={styles.swipeInstructions}>
            <Text style={styles.swipeText}>{t('workouts.swipeToNavigate')}</Text>
          </View>
        </ScrollView>
      </View>
    );
  };
  
  const renderActiveWorkout = () => {
    if (!workout) return null;
    
    const completedGroupCount = groups.filter(g => isGroupCompleted(g)).length;
    
    return (
      <View style={styles.activeWorkoutContainer}>
        <View style={styles.activeWorkoutTopRow}>
          <View style={styles.progressIndicator}>
            <Text style={styles.progressText}>
              Group {currentGroupIndex + 1} of {groups.length}
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(completedGroupCount / groups.length) * 100}%` }
                ]} 
              />
            </View>
          </View>
          <TouchableOpacity
            onPress={handleEndWorkout}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.endWorkoutTopBtn}
          >
            <Text style={styles.endWorkoutTopText}>{t('workouts.endWorkout')}</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          ref={groupFlatListRef}
          data={groups}
          keyExtractor={(item) => item.label}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={{ width: CARD_WIDTH }}
          onViewableItemsChanged={handleGroupViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={(_, index) => ({ length: CARD_WIDTH, offset: CARD_WIDTH * index, index })}
          renderItem={renderGroupCard}
        />
      </View>
    );
  };
  
  const renderNoteModal = () => (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>{t('workouts.addNote')}</Text>
        
        <Input
          placeholder="Enter your notes about this exercise..."
          value={currentNote}
          onChangeText={setCurrentNote}
          multiline
          containerStyle={styles.noteInput}
        />
        
        <View style={styles.modalButtons}>
          <Button
            title={t('common.cancel')}
            onPress={() => setNoteModalVisible(false)}
            variant="outline"
            style={styles.modalButton}
          />
          
          <Button
            title={t('common.save')}
            onPress={handleSaveNote}
            style={styles.modalButton}
          />
        </View>
      </View>
    </View>
  );
  
  const renderVideoModal = () => (
    <View style={styles.videoModalOverlay}>
      <View style={styles.videoModalContent}>
        <TouchableOpacity 
          style={styles.closeVideoButton}
          onPress={handleCloseVideo}
        >
          <Text style={styles.closeVideoText}>×</Text>
        </TouchableOpacity>
        
        <Video
          ref={videoRef}
          source={{ uri: currentVideoUrl }}
          style={styles.video}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          isLooping
          shouldPlay
        />
      </View>
    </View>
  );
  
  const renderCompletionView = () => (
    <View style={styles.completionView}>
      {showConfetti && <Confetti />}
      <View style={styles.completionContent}>
        <Award size={80} color={colors.success} style={styles.completionIcon} />
        <Text style={styles.completionTitle}>{t('workouts.congratulations')}</Text>
        <Text style={styles.completionText}>{t('workouts.workoutCompletedMessage')}</Text>
        
        <Button
          title={t('workouts.returnToHome')}
          onPress={() => {
            setShowConfetti(false);
            setShowCompletionMessage(false);
            router.replace('/(tabs)');
          }}
          style={styles.completionButton}
          icon={<CheckCircle size={24} color={colors.text} />}
        />
      </View>
    </View>
  );
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={globalStyles.container} edges={['bottom', 'left', 'right']}>
        {showCompletionMessage ? (
          renderCompletionView()
        ) : (
          <>
            {isWorkoutActive && activeWorkout?.id === id ? renderActiveWorkout() : renderWorkoutDetails()}
            {noteModalVisible && renderNoteModal()}
            {showVideo && renderVideoModal()}
          </>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  );
  return match?.[1] ?? null;
}

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};