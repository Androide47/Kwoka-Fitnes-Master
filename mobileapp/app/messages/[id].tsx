import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Send, ArrowLeft, Paperclip } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-colors';
import type { AppColors } from '@/constants/color-palettes';
import { useMessageStore } from '@/store/message-store';
import { useAuthStore } from '@/store/auth-store';
import { useLanguageStore } from '@/store/language-store';
import { mockTrainer } from '@/mocks/users';
import { Avatar } from '@/components/Avatar';
import type { Client } from '@/types';

function createChatStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      marginRight: theme.spacing.md,
    },
    headerTitle: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },
    headerAvatarWrap: {
      marginLeft: theme.spacing.sm,
    },
    keyboardAvoiding: {
      flex: 1,
    },
    listContent: {
      padding: theme.spacing.md,
      gap: theme.spacing.md,
    },
    messageRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      marginBottom: 4,
    },
    myMessageRow: {
      justifyContent: 'flex-end',
    },
    otherMessageRow: {
      justifyContent: 'flex-start',
    },
    messageAvatar: {
      marginRight: 8,
    },
    messageBubble: {
      maxWidth: '80%',
      padding: 12,
      borderRadius: 16,
    },
    myBubble: {
      backgroundColor: colors.primary,
      borderBottomRightRadius: 4,
    },
    otherBubble: {
      backgroundColor: colors.card,
      borderBottomLeftRadius: 4,
    },
    messageText: {
      fontSize: 16,
      lineHeight: 22,
    },
    myMessageText: {
      color: '#fff',
    },
    otherMessageText: {
      color: colors.text,
    },
    timestamp: {
      fontSize: 10,
      marginTop: 4,
      alignSelf: 'flex-end',
    },
    myTimestamp: {
      color: 'rgba(255, 255, 255, 0.7)',
    },
    otherTimestamp: {
      color: colors.textSecondary,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    attachButton: {
      padding: 8,
    },
    input: {
      flex: 1,
      backgroundColor: colors.backgroundLight,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      maxHeight: 100,
      marginHorizontal: theme.spacing.sm,
      color: colors.text,
      fontSize: 16,
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sendButtonDisabled: {
      backgroundColor: colors.textSecondary,
      opacity: 0.5,
    },
  });
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user, clients, isTrainer } = useAuthStore();
  const { getConversation, sendMessage } = useMessageStore();
  const language = useLanguageStore((s) => s.language);
  const t = useLanguageStore((s) => s.t);
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createChatStyles(colors), [colors]);

  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const conversationMessages = user && id ? getConversation(user.id, id as string) : [];

  const [otherParticipant, setOtherParticipant] = useState<{
    name: string;
    role?: string;
    avatar?: string;
  }>({ name: '' });

  useEffect(() => {
    if (isTrainer && id) {
      const client = clients.find((c) => c.id === id);
      if (client) {
        setOtherParticipant({
          name: client.name,
          role: t('messages.roleClient'),
          avatar: client.avatar,
        });
      }
    } else if (user && id) {
      const trainerId = id as string;
      if (trainerId === mockTrainer.id) {
        setOtherParticipant({
          name: mockTrainer.name,
          role: t('auth.trainer'),
          avatar: mockTrainer.avatar,
        });
      } else {
        const client = user as Client;
        const name =
          client.trainerId === mockTrainer.id ? mockTrainer.name : t('messages.fallbackTrainerName');
        const avatar = client.trainerId === mockTrainer.id ? mockTrainer.avatar : undefined;
        setOtherParticipant({
          name,
          role: t('auth.trainer'),
          avatar,
        });
      }
    }
  }, [id, isTrainer, clients, t, user]);

  const handleSend = () => {
    if (inputText.trim() && id && user) {
      sendMessage(inputText, id as string);
      setInputText('');
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const renderMessage = ({ item }: { item: { id: string; senderId: string; content: string; timestamp: string } }) => {
    const isMe = item.senderId === user?.id;

    return (
      <View style={[styles.messageRow, isMe ? styles.myMessageRow : styles.otherMessageRow]}>
        {!isMe && (
          <Avatar
            source={otherParticipant?.avatar}
            name={otherParticipant?.name}
            size={30}
            style={styles.messageAvatar}
          />
        )}
        <View style={[styles.messageBubble, isMe ? styles.myBubble : styles.otherBubble]}>
          <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.otherMessageText]}>
            {item.content}
          </Text>
          <Text style={[styles.timestamp, isMe ? styles.myTimestamp : styles.otherTimestamp]}>
            {new Date(item.timestamp).toLocaleTimeString(language === 'es' ? 'es-ES' : 'en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  const headerLabel = `${t('messages.conversationPrefix')} ${otherParticipant?.name || t('common.user')}`;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {headerLabel}
        </Text>

        <View style={styles.headerAvatarWrap}>
          <Avatar source={otherParticipant?.avatar} name={otherParticipant?.name} size={40} />
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
        style={styles.keyboardAvoiding}
      >
        <FlatList
          ref={flatListRef}
          data={[...conversationMessages]}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        <View
          style={[
            styles.inputContainer,
            { paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, theme.spacing.sm) : theme.spacing.sm },
          ]}
        >
          <TouchableOpacity style={styles.attachButton}>
            <Paperclip size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder={t('messages.typeMessage')}
            placeholderTextColor={colors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />

          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Send size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
