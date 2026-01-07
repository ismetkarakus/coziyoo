import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Text, ChatListItem } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { useAuth } from '../../../context/AuthContext';
import { chatService, Chat } from '../../../services/chatService';

export const ChatList: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadChats();
      
      // Real-time listener
      const unsubscribe = chatService.onChatsUpdate(user.uid, 'buyer', (updatedChats) => {
        setChats(updatedChats);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [user]);

  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        loadChats();
      }
    }, [user])
  );

  const loadChats = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userChats = await chatService.getUserChats(user.uid, 'buyer');
      setChats(userChats);
    } catch (error) {
      console.error('Error loading chats:', error);
      Alert.alert('Hata', 'Sohbetler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadChats();
    setRefreshing(false);
  };

  const handleChatPress = (chat: Chat) => {
    router.push(`/chat?id=${chat.id}&name=${encodeURIComponent(chat.sellerName)}&type=buyer`);
  };

  const renderChatItem = ({ item }: { item: Chat }) => (
    <ChatListItem
      chat={item}
      currentUserId={user?.uid || ''}
      currentUserType="buyer"
      onPress={() => handleChatPress(item)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text variant="heading" style={{ color: colors.textSecondary, fontSize: 48 }}>
        💬
      </Text>
      <Text variant="subheading" style={{ color: colors.text, marginTop: Spacing.md }}>
        Henüz sohbet yok
      </Text>
      <Text variant="body" style={{ color: colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm }}>
        Satıcılarla iletişim kurmak için sipariş verin veya mesaj gönderin
      </Text>
    </View>
  );

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <TopBar title="Sohbetler" />
        <View style={styles.emptyContainer}>
          <Text variant="body" color="textSecondary">
            Sohbetleri görüntülemek için giriş yapın
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar title="Sohbetler" />
      
      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id || ''}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={!loading ? renderEmptyState : null}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={chats.length === 0 ? styles.emptyListContainer : undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyListContainer: {
    flex: 1,
  },
});

