import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MessageCircle } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useGlobalStyles } from '@/hooks/use-themed-styles';
import { useAppColors } from '@/hooks/use-app-colors';
import type { AppColors } from '@/constants/color-palettes';
import { useMessageStore } from '@/store/message-store';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/Button';
import { Client } from '@/types';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const day = 24 * 60 * 60 * 1000;

  if (diff < day) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (diff < 7 * day) {
    return date.toLocaleDateString([], { weekday: 'short' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.md,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginBottom: theme.spacing.md,
    },
    listContent: {
      paddingBottom: theme.spacing.md,
    },
    conversationItem: {
      flexDirection: 'row',
      padding: theme.spacing.md,
      backgroundColor: colors.card,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.sm,
      alignItems: 'center',
    },
    unreadItem: {
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.backgroundLight,
      marginRight: theme.spacing.md,
    },
    content: {
      flex: 1,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    name: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    time: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    bottomRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    messagePreview: {
      fontSize: 14,
      color: colors.textSecondary,
      flex: 1,
      marginRight: theme.spacing.sm,
      height: 20,
    },
    unreadText: {
      fontWeight: '700',
      color: colors.text,
    },
    badge: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 6,
    },
    badgeText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '700',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 100,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: theme.spacing.lg,
    },
    emptyButton: {
      minWidth: 220,
    },
  });
}

interface ConversationItem {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: { timestamp: string; content: string; read?: boolean; receiverId: string };
  unreadCount: number;
}

export default function MessagesScreen() {
  const router = useRouter();
  const { user, isTrainer, clients } = useAuthStore();
  const { messages } = useMessageStore();
  const globalStyles = useGlobalStyles();
  const colors = useAppColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [conversations, setConversations] = useState<ConversationItem[]>([]);

  useEffect(() => {
    if (!user) return;
    const currentUser = user;
    const conversationMap = new Map<string, ConversationItem>();

    messages.forEach((msg) => {
      const otherId = msg.senderId === currentUser.id ? msg.receiverId : msg.senderId;

      if (!conversationMap.has(otherId)) {
        let otherUser: { name: string; avatar?: string; id: string } = {
          name: 'User',
          avatar: undefined,
          id: otherId,
        };

        if (isTrainer) {
          const client = clients.find((c) => c.id === otherId);
          if (client) otherUser = { name: client.name, avatar: client.avatar, id: client.id };
        } else {
          otherUser = { name: 'Trainer', avatar: undefined, id: otherId };
        }

        conversationMap.set(otherId, {
          id: otherId,
          name: otherUser.name,
          avatar: otherUser.avatar,
          lastMessage: msg,
          unreadCount: 0,
        });
      }

      const conv = conversationMap.get(otherId)!;
      if (new Date(msg.timestamp) > new Date(conv.lastMessage.timestamp)) {
        conv.lastMessage = msg;
      }
      if (msg.receiverId === currentUser.id && !msg.read) {
        conv.unreadCount += 1;
      }
    });

    const sortedConvs = Array.from(conversationMap.values()).sort(
      (a, b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime(),
    );

    setConversations(sortedConvs);
  }, [messages, user, isTrainer, clients]);

  const renderItem = ({ item }: { item: ConversationItem }) => (
    <TouchableOpacity
      style={[styles.conversationItem, item.unreadCount > 0 && styles.unreadItem]}
      onPress={() => router.push(`/messages/${item.id}`)}
    >
      <Image source={{ uri: item.avatar || 'https://via.placeholder.com/50' }} style={styles.avatar} />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={[styles.name, item.unreadCount > 0 && styles.unreadText]}>{item.name}</Text>
          <Text style={styles.time}>{formatDate(item.lastMessage.timestamp)}</Text>
        </View>

        <View style={styles.bottomRow}>
          <Text
            style={[styles.messagePreview, item.unreadCount > 0 && styles.unreadText]}
            numberOfLines={1}
          >
            {item.lastMessage.content}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Messages</Text>

        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No messages yet</Text>
              {!isTrainer && user && (user as Client).trainerId && (
                <Button
                  title="Send Message to Coach"
                  onPress={() => router.push(`/messages/${(user as Client).trainerId}`)}
                  style={styles.emptyButton}
                  icon={<MessageCircle size={20} color={colors.text} />}
                />
              )}
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}
