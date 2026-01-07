import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, Card } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { WebSafeIcon } from '../../../components/ui';

interface FavoriteItem {
  id: string;
  name: string;
  cookName: string;
  price: number;
  rating: number;
  imageUrl: string;
  category: string;
}

export const Favorites: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const data = await AsyncStorage.getItem('favorites');
      if (data) {
        setFavorites(JSON.parse(data));
      } else {
        // Mock favorites
        const mockFavorites: FavoriteItem[] = [
          {
            id: '1',
            name: 'Mantı',
            cookName: 'Ayşe Hanım',
            price: 25,
            rating: 4.8,
            imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=160&h=140&fit=crop',
            category: 'Ana Yemek',
          },
          {
            id: '2',
            name: 'Baklava',
            cookName: 'Mehmet Usta',
            price: 15,
            rating: 4.9,
            imageUrl: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=160&h=140&fit=crop',
            category: 'Tatlı',
          },
        ];
        setFavorites(mockFavorites);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const removeFavorite = async (itemId: string) => {
    const updatedFavorites = favorites.filter(item => item.id !== itemId);
    setFavorites(updatedFavorites);
    await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  const navigateToFood = (item: FavoriteItem) => {
    const route = `/food-detail?id=${item.id}&name=${encodeURIComponent(item.name)}&cookName=${encodeURIComponent(item.cookName)}&imageUrl=${encodeURIComponent(item.imageUrl)}&deliveryType=Pickup`;
    router.push(route);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar 
        title="Favorilerim"
        leftComponent={
          <TouchableOpacity onPress={() => router.back()}>
            <WebSafeIcon name="arrow-left" size={20} color={colors.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {favorites.map((item) => (
          <Card key={item.id} style={styles.favoriteCard}>
            <TouchableOpacity
              style={styles.favoriteContent}
              onPress={() => navigateToFood(item)}
            >
              <View style={styles.favoriteImage}>
                <Text style={styles.foodEmoji}>🍽️</Text>
              </View>
              
              <View style={styles.favoriteInfo}>
                <Text variant="subheading" weight="medium" numberOfLines={1}>
                  {item.name}
                </Text>
                <Text variant="body" color="textSecondary" numberOfLines={1}>
                  {item.cookName}
                </Text>
                <View style={styles.favoriteDetails}>
                  <Text variant="body" color="primary" weight="medium">
                    ₺{item.price}
                  </Text>
                  <View style={styles.rating}>
                    <Text style={styles.star}>⭐</Text>
                    <Text variant="caption" color="textSecondary">
                      {item.rating}
                    </Text>
                  </View>
                </View>
                <Text variant="caption" color="textSecondary" style={styles.category}>
                  {item.category}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.removeButton}
                onPress={(e) => {
                  e.stopPropagation();
                  removeFavorite(item.id);
                }}
              >
                <WebSafeIcon name="trash" size={18} color={colors.error} />
              </TouchableOpacity>
            </TouchableOpacity>
          </Card>
        ))}

        {favorites.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>💔</Text>
            <Text variant="subheading" weight="medium" style={styles.emptyTitle}>
              Henüz favori yemek yok
            </Text>
            <Text variant="body" color="textSecondary" style={styles.emptyText}>
              Beğendiğiniz yemekleri favorilere ekleyerek buradan kolayca ulaşabilirsiniz.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  favoriteCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  favoriteContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  foodEmoji: {
    fontSize: 24,
  },
  favoriteInfo: {
    flex: 1,
  },
  favoriteDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    fontSize: 12,
    marginRight: 2,
  },
  category: {
    marginTop: Spacing.xs,
  },
  removeButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl * 3,
    paddingHorizontal: Spacing.lg,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    lineHeight: 20,
  },
});


