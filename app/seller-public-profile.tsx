import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Text, Card, HeaderBackButton } from '@/src/components/ui';
import { TopBar } from '@/src/components/layout';
import { Colors, Spacing } from '@/src/theme';
import { useColorScheme } from '@/components/useColorScheme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import sellerMock from '@/src/constants/sellerMock';
import { useTranslation } from '@/src/hooks/useTranslation';
import { useCountry } from '@/src/context/CountryContext';
import { getFavoriteMeta, toggleFavorite } from '@/src/services/favoriteService';
import { useAuth } from '@/src/context/AuthContext';
import { foodService, Food } from '@/src/services/foodService';
import { normalizeUsername } from '@/src/utils/username';
import { mockUserService } from '@/src/services/mockUserService';
import { getAvatarByGender } from '@/src/utils/avatarByGender';

const toDisplayHandle = (rawValue: string): string => {
  const normalized = normalizeUsername(rawValue || 'seller', 'seller').replace(/^seller_/, '');
  return `@${normalized}`;
};

export default function SellerProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDarkMode = (colorScheme ?? 'light') === 'dark';
  const params = useLocalSearchParams();
  const { currentLanguage } = useTranslation();
  const { formatCurrency } = useCountry();
  const { userData } = useAuth();
  const [overrideNickname, setOverrideNickname] = useState<string>('');
  const [overrideName, setOverrideName] = useState<string>('');
  const [overrideAvatar, setOverrideAvatar] = useState<string>('');
  const [sellerAvatarFromDb, setSellerAvatarFromDb] = useState<string>('');
  const [favoriteCounts, setFavoriteCounts] = useState<Record<string, number>>({});
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [sellerFoods, setSellerFoods] = useState<Food[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [commentFilter, setCommentFilter] = useState<'all' | '5' | '4' | '3'>('all');
  const [commentQuery, setCommentQuery] = useState('');
  const [commentSort, setCommentSort] = useState<'newest' | 'rating_desc' | 'rating_asc' | 'author_asc'>('newest');
  
  const cookName = params.cookName as string;
  const cookId = params.cookId as string | undefined;
  const sectionParamRaw = params.section;
  const sectionParam = Array.isArray(sectionParamRaw) ? sectionParamRaw[0] : sectionParamRaw;
  const [activeTab, setActiveTab] = useState<'foods' | 'comments'>(() =>
    sectionParam === 'comments' ? 'comments' : 'foods'
  );
  const localizedProfile = (sellerMock as any)[currentLanguage]?.profile || (sellerMock as any).tr?.profile;
  const localizedSellers = (sellerMock as any)[currentLanguage]?.sellers || (sellerMock as any).tr?.sellers || [];
  const sellerData =
    localizedSellers.find((seller: any) => seller.name === cookName) ||
    localizedSellers.find((seller: any) => seller.nickname === cookName);
  const isCurrentSeller =
    !!localizedProfile &&
    (cookName === localizedProfile.name || (localizedProfile.nickname && cookName === localizedProfile.nickname));
  const inferredNameFromFoods = sellerFoods.find((food) => String(food.cookName || '').trim())?.cookName || '';
  const displayName =
    overrideName ||
    sellerData?.name ||
    inferredNameFromFoods ||
    cookName ||
    (currentLanguage === 'en' ? 'Food Seller' : 'Yemek Sahibi');
  const displayNickname = overrideNickname || sellerData?.nickname || '';
  const displayAvatar =
    overrideAvatar ||
    sellerAvatarFromDb ||
    sellerData?.avatar ||
    getAvatarByGender(undefined, cookId || cookName || displayName);
  const sellerInfo = sellerData || {
    rating: 4.8,
    totalOrders: sellerFoods.length > 0 ? sellerFoods.length : 0,
    location: currentLanguage === 'en' ? 'Unknown location' : 'Konum yok',
    distance: '—',
    joinDate: currentLanguage === 'en' ? 'Recently joined' : 'Yeni katıldı',
    description:
      currentLanguage === 'en'
        ? 'This seller profile is available, but some details are still loading.'
        : 'Bu satıcı profili mevcut, ancak bazı bilgiler henüz yükleniyor.',
    specialties: [],
  };
  const deliveryTimeLabel = currentLanguage === 'en' ? 'Delivery Time' : 'Teslimat Süresi';
  const sellerPrepTime =
    String(
      sellerFoods.find((food) => typeof food.prepTime === 'string' && food.prepTime.trim())?.prepTime ||
      sellerFoods.find((food) => typeof food.preparationTime === 'number' && food.preparationTime > 0)?.preparationTime ||
      (currentLanguage === 'en' ? '30 min' : '30 dk')
    );
  const sellerHandle = toDisplayHandle(displayNickname || displayName || cookName || 'seller');

  useEffect(() => {
    if (sectionParam === 'comments') {
      setActiveTab('comments');
      return;
    }
    setActiveTab('foods');
  }, [sectionParam]);

  useEffect(() => {
    const loadSellerFoods = async () => {
      try {
        const allFoods = await foodService.getAllFoods();
        const matchName = isCurrentSeller ? localizedProfile.name : cookName;
        const resolvedCookId = cookId || (cookName && /^[sb]_[a-z0-9_]+$/i.test(cookName) ? cookName : '');
        const matched = allFoods.filter((food: any) => {
          const byCookId = resolvedCookId && String(food.cookId || '') === String(resolvedCookId);
          const bySellerId = resolvedCookId && String(food.sellerId || '') === String(resolvedCookId);
          const byCookName = String(food.cookName || '') === String(matchName || '');
          return Boolean(byCookId || bySellerId || byCookName);
        });
        setSellerFoods(matched);
      } catch (error) {
        console.error('Error loading seller foods:', error);
        setSellerFoods([]);
      }
    };
    loadSellerFoods();
  }, [cookId, cookName, isCurrentSeller, localizedProfile.name]);

  useEffect(() => {
    if (!isCurrentSeller) return;
    if (userData?.displayName) {
      setOverrideName(userData.displayName);
    }
    if (userData?.sellerNickname) {
      setOverrideNickname(userData.sellerNickname);
    }
    if (userData?.avatarUri) {
      setOverrideAvatar(userData.avatarUri);
    }
  }, [cookName, isCurrentSeller, userData?.displayName, userData?.sellerNickname, userData?.avatarUri]);

  useEffect(() => {
    const loadSellerAvatar = async () => {
      if (isCurrentSeller && userData?.avatarUri) {
        setSellerAvatarFromDb(userData.avatarUri);
        return;
      }
      const uidCandidate = String(cookId || '').trim();
      if (!uidCandidate) {
        setSellerAvatarFromDb('');
        return;
      }
      const sellerUser = await mockUserService.getUserByUid(uidCandidate);
      if (sellerUser?.avatarUri) {
        setSellerAvatarFromDb(String(sellerUser.avatarUri));
        return;
      }
      setSellerAvatarFromDb(getAvatarByGender(sellerUser?.gender, uidCandidate || cookName || displayName));
    };

    loadSellerAvatar().catch((error) => {
      console.error('Error loading seller avatar from db:', error);
      setSellerAvatarFromDb('');
    });
  }, [cookId, cookName, displayName, isCurrentSeller, userData?.avatarUri]);

  useEffect(() => {
    const loadFavoriteState = async () => {
      try {
        const meta = await getFavoriteMeta();
        setFavoriteCounts(meta.favoriteCounts);
        setFavoriteIds(meta.favoriteIds);
      } catch (error) {
        console.error('Error loading seller profile favorites:', error);
      }
    };

    loadFavoriteState();
  }, []);
  
  // Group foods by category
  const foodsByCategory = sellerFoods.reduce((acc, food) => {
    if (!acc[food.category]) {
      acc[food.category] = [];
    }
    acc[food.category].push(food);
    return acc;
  }, {} as { [key: string]: any[] });

  const categoryTabs = [
    {
      key: 'all',
      label: currentLanguage === 'en' ? 'All' : 'Tümü',
      count: sellerFoods.length,
    },
    ...Object.entries(foodsByCategory).map(([category, foods]) => ({
      key: category,
      label: category,
      count: foods.length,
    })),
  ];

  const filteredFoodsByCategory =
    selectedCategory === 'all'
      ? foodsByCategory
      : (Object.fromEntries(
          Object.entries(foodsByCategory).filter(([category]) => category === selectedCategory)
        ) as { [key: string]: any[] });

  const filteredFoods = selectedCategory === 'all'
    ? sellerFoods
    : sellerFoods.filter((food) => String(food.category) === selectedCategory);

  useEffect(() => {
    if (selectedCategory !== 'all' && !foodsByCategory[selectedCategory]) {
      setSelectedCategory('all');
    }
  }, [foodsByCategory, selectedCategory]);

  const sellerComments = (() => {
    const authorPool =
      currentLanguage === 'en'
        ? ['Aylin', 'Murat', 'Selin', 'Emre', 'Zehra', 'Baris']
        : ['Aylin', 'Murat', 'Selin', 'Emre', 'Zehra', 'Barış'];

    if (sellerFoods.length === 0) {
      return [
        {
          id: 'fallback-1',
          author: authorPool[0],
          rating: 4.8,
          foodName: displayName,
          text:
            currentLanguage === 'en'
              ? 'Excellent communication and clean packaging. Highly recommended.'
              : 'Iletisimi cok iyi ve paketleme temizdi. Kesinlikle tavsiye ederim.',
        },
      ];
    }

    return sellerFoods.slice(0, 12).map((food, index) => {
      const rating = Math.max(1, Math.min(5, Number(food.rating || 4.7)));
      return {
        id: `${String(food.id || food.name)}-comment-${index}`,
        author: authorPool[index % authorPool.length],
        rating,
        foodName: food.name,
        createdAt: String((food as any).createdAt || new Date(Date.now() - index * 60000).toISOString()),
        text:
          currentLanguage === 'en'
            ? `${food.name} was very tasty. ${displayName} delivered exactly on time.`
            : `${food.name} cok lezzetliydi. ${displayName} zamaninda teslim etti.`,
      };
    });
  })();

  const filteredComments = sellerComments.filter((comment) => {
    const minRating = commentFilter === '5' ? 5 : commentFilter === '4' ? 4 : commentFilter === '3' ? 3 : 0;
    if (comment.rating < minRating) {
      return false;
    }

    const normalizedQuery = commentQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return true;
    }

    const haystack = `${comment.author} ${comment.foodName} ${comment.text}`.toLowerCase();
    return haystack.includes(normalizedQuery);
  });

  const sortedComments = [...filteredComments].sort((a, b) => {
    if (commentSort === 'rating_desc') return b.rating - a.rating;
    if (commentSort === 'rating_asc') return a.rating - b.rating;
    if (commentSort === 'author_asc') return a.author.localeCompare(b.author, 'tr');
    const aTime = new Date((a as any).createdAt || 0).getTime();
    const bTime = new Date((b as any).createdAt || 0).getTime();
    return bTime - aTime;
  });

  const openFoodDetail = (food: Food) => {
    router.push(
      `/food-detail-order?id=${encodeURIComponent(String(food.id ?? ''))}&name=${encodeURIComponent(food.name)}&cookName=${encodeURIComponent(food.cookName)}&cookId=${encodeURIComponent(String(food.cookId || cookId || ''))}&imageUrl=${encodeURIComponent(food.imageUrl || '')}&price=${Number(food.price || 0)}` as any
    );
  };

  const handleFavoritePress = async (food: Food) => {
    try {
      const result = await toggleFavorite({
        id: String(food.id),
        name: food.name,
        cookName: food.cookName,
        price: Number(food.price || 0),
        rating: Number(food.rating || 0),
        imageUrl:
          food.imageUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
        category: food.category || (currentLanguage === 'en' ? 'Main Dish' : 'Ana Yemek'),
      });
      setFavoriteCounts(result.meta.favoriteCounts);
      setFavoriteIds(result.meta.favoriteIds);
    } catch (error) {
      console.error('Error toggling seller profile favorite:', error);
    }
  };

  if (!cookName && !cookId && !sellerData && sellerFoods.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <TopBar 
          title="Yemek Sahibi Bulunamadı"
          leftComponent={<HeaderBackButton />}
        />
        <View style={styles.errorContainer}>
          <Text variant="heading" center>Yemek Sahibi Bulunamadı</Text>
          <Text variant="body" center color="textSecondary" style={{ marginTop: 8 }}>
            Bu yemek sahibinin profili mevcut değil veya güncellenmiyor.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title="Sef Bilgisi"
        leftComponent={<HeaderBackButton />}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Seller Info */}
        <Card variant="default" padding="md" style={styles.sellerCard}>
          <View style={styles.sellerHeader}>
            <Image 
              source={{ uri: displayAvatar }}
              style={styles.avatar}
            />
            <View style={styles.sellerInfo}>
              <View style={styles.sellerNameRow}>
                <Text variant="body" weight="bold" style={styles.sellerName}>
                  {displayName}
                </Text>
                <MaterialIcons name="arrow-forward-ios" size={14} color="#6B7280" />
              </View>
              <Text variant="caption" color="textSecondary" style={styles.sellerHandle}>
                {sellerHandle}
              </Text>
              <View style={styles.ratingRow}>
                <MaterialIcons name="star" size={16} color="#FFD700" />
                <Text variant="body" weight="medium" style={styles.sellerRatingText}>
                  {sellerInfo.rating}
                </Text>
                <Text variant="caption" color="textSecondary" style={styles.sellerReviewCount}>
                  {currentLanguage === 'en'
                    ? `${sellerComments.length} reviews`
                    : `${sellerComments.length} yorum`}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setActiveTab('comments')}
                  style={styles.seeAllCommentsButton}
                >
                  <Text variant="caption" weight="semibold" style={styles.seeAllCommentsText}>
                    {currentLanguage === 'en' ? 'See all' : 'Tumunu gor'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={styles.sellerMetaInlineRow}>
            <Text variant="caption" weight="medium" style={styles.sellerMetaInlineText}>
              {deliveryTimeLabel}: {sellerPrepTime}
            </Text>
            <Text variant="caption" weight="medium" style={styles.sellerMetaInlineText}>
              {currentLanguage === 'en' ? 'Distance' : 'Mesafe'}: {sellerInfo.distance}
            </Text>
          </View>
          <View style={styles.sellerStatsRow}>
            <View style={styles.sellerStatBox}>
              <Text variant="caption" color="textSecondary" style={styles.sellerStatLabel}>
                {currentLanguage === 'en' ? 'Menu Items' : 'Menu Sayisi'}
              </Text>
              <Text variant="body" weight="bold" style={styles.sellerStatValue}>
                {sellerFoods.length}
              </Text>
            </View>
            <View style={styles.sellerStatBox}>
              <Text variant="caption" color="textSecondary" style={styles.sellerStatLabel}>
                {currentLanguage === 'en' ? 'Total Orders' : 'Toplam Siparis'}
              </Text>
              <Text variant="body" weight="bold" style={styles.sellerStatValue}>
                {sellerInfo.totalOrders}
              </Text>
            </View>
          </View>
        </Card>

        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              {
                backgroundColor: isDarkMode ? colors.surface : '#F5F7F5',
                borderColor: colors.border,
              },
              activeTab === 'foods'
                ? {
                    backgroundColor: '#8B9D8A',
                    borderColor: '#8B9D8A',
                  }
                : null,
            ]}
            activeOpacity={0.85}
            onPress={() => setActiveTab('foods')}
          >
            <Text
              style={[
                styles.tabButtonText,
                {
                  color: activeTab === 'foods' ? '#FFFFFF' : isDarkMode ? '#FFFFFF' : colors.textSecondary,
                },
                activeTab === 'foods' ? styles.tabButtonTextActive : null,
              ]}
            >
              {currentLanguage === 'en' ? `Foods (${sellerFoods.length})` : `Yemekler (${sellerFoods.length})`}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              {
                backgroundColor: isDarkMode ? colors.surface : '#F5F7F5',
                borderColor: colors.border,
              },
              activeTab === 'comments'
                ? {
                    backgroundColor: '#8B9D8A',
                    borderColor: '#8B9D8A',
                  }
                : null,
            ]}
            activeOpacity={0.85}
            onPress={() => setActiveTab('comments')}
          >
            <Text
              style={[
                styles.tabButtonText,
                {
                  color: activeTab === 'comments' ? '#FFFFFF' : isDarkMode ? '#FFFFFF' : colors.textSecondary,
                },
                activeTab === 'comments' ? styles.tabButtonTextActive : null,
              ]}
            >
              {currentLanguage === 'en' ? `Comments (${sellerComments.length})` : `Yorumlar (${sellerComments.length})`}
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'foods' ? (
          <View style={styles.foodsContainer}>
            <Text variant="heading" weight="bold" style={styles.sectionTitle}>
              {currentLanguage === 'en'
                ? `All Foods (${filteredFoods.length})`
                : `Tüm Yemekleri (${filteredFoods.length})`}
            </Text>

            <View style={styles.altListSection}>
              <View style={styles.categoryTabsDivider} />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryTabsScroller}
              >
                {categoryTabs.map((tab) => {
                  const isActive = selectedCategory === tab.key;
                  return (
                    <TouchableOpacity
                      key={`alt-tab-${tab.key}`}
                      style={[styles.categoryTabChip, isActive ? styles.categoryTabChipActive : null]}
                      activeOpacity={0.85}
                      onPress={() => setSelectedCategory(tab.key)}
                    >
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={[styles.categoryTabChipText, isActive ? styles.categoryTabChipTextActive : null]}
                      >
                        {`${tab.label} (${tab.count})`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <View style={styles.categoryTabsDivider} />

              {Object.entries(filteredFoodsByCategory).map(([category, foods]) => (
                <View key={`alt-group-${category}`} style={styles.altCategoryGroup}>
                  <Card variant="default" padding="sm" style={styles.altCategoryCard}>
                    <View style={[styles.categoryHeaderRow, styles.altCategoryHeaderCompact]}>
                      <View style={styles.categoryHeaderLeft}>
                        <MaterialIcons name="restaurant-menu" size={16} color="#2F5D3A" />
                        <Text variant="subheading" weight="bold" style={styles.categoryTitle}>
                          {category}
                        </Text>
                      </View>
                      <View style={styles.categoryCountBadge}>
                        <Text style={styles.categoryCountText}>{foods.length}</Text>
                      </View>
                    </View>

                    {foods.map((food: Food) => (
                      <TouchableOpacity
                        key={`alt-${String(food.id)}`}
                        activeOpacity={0.85}
                        style={styles.altFoodRow}
                        onPress={() => openFoodDetail(food)}
                      >
                        <Image
                          source={{
                            uri:
                              food.imageUrl ||
                              'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
                          }}
                          style={styles.altFoodImage}
                        />

                        <View style={styles.altFoodMain}>
                          <View style={styles.altTopRow}>
                            <Text style={[styles.altStockText, { color: colors.textSecondary }]}>
                              {currentLanguage === 'en'
                                ? `${food.currentStock ?? 0} amount remaining`
                                : `${food.currentStock ?? 0} adet kaldı`}
                            </Text>
                          </View>

                          <Text style={[styles.altFoodName, { color: colors.text }]} numberOfLines={1}>
                            {food.name}
                          </Text>

                          <View style={styles.altDeliveryRow}>
                            {food.hasPickup !== false ? (
                              <View style={styles.altDeliveryMetaItem}>
                                <MaterialIcons name="storefront" size={12} color="#67727E" />
                                <Text style={styles.altDeliveryMetaText}>
                                  {currentLanguage === 'en' ? 'Pickup available' : 'Gel Al mevcut'}
                                </Text>
                              </View>
                            ) : (
                              <View style={styles.altDeliveryMetaItem}>
                                <MaterialIcons name="local-shipping" size={12} color="#67727E" />
                                <Text style={styles.altDeliveryMetaText}>
                                  {currentLanguage === 'en' ? 'Delivery only' : 'Sadece teslimat'}
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>

                        <View style={styles.altFoodRight}>
                          <Text style={[styles.altFoodPrice, { color: colors.primary }]}>
                            {formatCurrency(Number(food.price || 0))}
                          </Text>
                          <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </Card>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.commentsTabSection}>
            <View style={styles.commentsHeaderRow}>
              <Text variant="heading" weight="bold" style={styles.sectionTitleNoMargin}>
                {currentLanguage === 'en' ? 'All Comments' : 'Tüm Yorumlar'}
              </Text>
              <View style={styles.headerStarFilterRow}>
                {[
                  { id: 'all', label: currentLanguage === 'en' ? 'All' : 'Tümü' },
                  { id: '5', label: '5★' },
                  { id: '4', label: '4★+' },
                  { id: '3', label: '3★+' },
                ].map((chip) => (
                  <TouchableOpacity
                    key={chip.id}
                    style={[
                      styles.commentFilterChip,
                      {
                        backgroundColor: isDarkMode ? colors.surface : '#F9FAFB',
                        borderColor: colors.border,
                      },
                      commentFilter === (chip.id as any) ? styles.commentFilterChipActive : null,
                    ]}
                    activeOpacity={0.85}
                    onPress={() => setCommentFilter(chip.id as 'all' | '5' | '4' | '3')}
                  >
                    <Text
                      style={[
                        styles.commentFilterChipText,
                        { color: commentFilter === (chip.id as any) ? colors.primary : colors.textSecondary },
                        commentFilter === (chip.id as any) ? styles.commentFilterChipTextActive : null,
                      ]}
                    >
                      {chip.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.commentsFilterWrap}>
              <View style={[styles.commentSearchWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <MaterialIcons name="search" size={16} color="#8B8F95" />
                <TextInput
                  value={commentQuery}
                  onChangeText={setCommentQuery}
                  placeholder={currentLanguage === 'en' ? 'Search comments...' : 'Yorum ara...'}
                  placeholderTextColor="#9CA3AF"
                  style={[styles.commentSearchInput, { color: colors.text }]}
                />
                {commentQuery.trim() ? (
                  <TouchableOpacity style={styles.commentSearchClear} onPress={() => setCommentQuery('')} activeOpacity={0.8}>
                    <MaterialIcons name="close" size={14} color="#8B8F95" />
                  </TouchableOpacity>
                  ) : null}
              </View>
              <View style={styles.commentSortRow}>
                <Text style={styles.commentSortLabel}>
                  {currentLanguage === 'en' ? 'Sort' : 'Sırala'}
                </Text>
                {[
                  { id: 'newest', label: currentLanguage === 'en' ? 'Newest' : 'En Yeni' },
                  { id: 'rating_desc', label: currentLanguage === 'en' ? 'Top Rated' : 'En Yüksek' },
                  { id: 'rating_asc', label: currentLanguage === 'en' ? 'Lowest' : 'En Düşük' },
                  { id: 'author_asc', label: currentLanguage === 'en' ? 'A-Z' : 'A-Z' },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.commentSortChip,
                      {
                        backgroundColor: isDarkMode ? colors.surface : '#F9FAFB',
                        borderColor: colors.border,
                      },
                      commentSort === (item.id as any) ? styles.commentSortChipActive : null,
                    ]}
                    activeOpacity={0.85}
                    onPress={() => setCommentSort(item.id as 'newest' | 'rating_desc' | 'rating_asc' | 'author_asc')}
                  >
                    <Text
                      style={[
                        styles.commentSortChipText,
                        { color: commentSort === (item.id as any) ? colors.primary : colors.textSecondary },
                        commentSort === (item.id as any) ? styles.commentSortChipTextActive : null,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            {sortedComments.length === 0 ? (
              <View style={styles.commentsEmpty}>
                <Text style={styles.commentsEmptyText}>
                  {currentLanguage === 'en' ? 'No comments match this filter.' : 'Bu filtreye uygun yorum bulunamadı.'}
                </Text>
              </View>
            ) : null}
            {sortedComments.map((comment) => (
              <View key={comment.id} style={[styles.commentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.commentHeader}>
                  <Text style={[styles.commentAuthor, { color: colors.text }]}>{comment.author}</Text>
                  <View style={styles.commentStars}>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <MaterialIcons
                        key={`${comment.id}-star-${index}`}
                        name={index < Math.round(comment.rating) ? 'star' : 'star-border'}
                        size={12}
                        color="#F59E0B"
                      />
                    ))}
                    <Text style={[styles.commentRating, { color: colors.textSecondary }]}>{comment.rating.toFixed(1)}</Text>
                  </View>
                </View>
                <Text style={[styles.commentFoodName, { color: colors.primary }]}>{comment.foodName}</Text>
                <Text style={[styles.commentText, { color: colors.textSecondary }]}>{comment.text}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  sellerCard: {
    margin: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#D9E5D9',
    shadowColor: '#253627',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  sellerHeader: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: Spacing.md,
  },
  sellerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  sellerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  sellerName: {
    flexShrink: 1,
    marginRight: Spacing.sm,
    fontSize: 18,
    lineHeight: 24,
    color: '#1F2937',
  },
  sellerHandle: {
    fontSize: 14,
    lineHeight: 20,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  sellerRatingText: {
    marginLeft: 4,
  },
  sellerReviewCount: {
    marginLeft: 8,
    fontSize: 13,
  },
  seeAllCommentsButton: {
    marginLeft: 'auto',
    borderWidth: 1,
    borderColor: '#CFE3D0',
    backgroundColor: '#EDF6EE',
    borderRadius: 999,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  seeAllCommentsText: {
    color: '#3B5F3F',
    fontSize: 12,
  },
  sellerMetaInlineRow: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  sellerMetaInlineText: {
    flex: 1,
    color: '#4B5563',
    fontSize: 14,
    lineHeight: 20,
  },
  sellerStatsRow: {
    marginTop: Spacing.sm,
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  sellerStatBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DCE8DC',
    borderRadius: 10,
    backgroundColor: '#F7FBF7',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    gap: 2,
  },
  sellerStatLabel: {
    fontSize: 13,
    lineHeight: 18,
  },
  sellerStatValue: {
    color: '#2D4A2D',
    fontSize: 18,
    lineHeight: 24,
  },
  foodsContainer: {
    paddingVertical: Spacing.md,
    paddingHorizontal: 0,
  },
  tabRow: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  tabButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D9DFD9',
    backgroundColor: '#F5F7F5',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#E8F2E8',
    borderColor: '#8FA08E',
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5B645B',
  },
  tabButtonTextActive: {
    fontWeight: '700',
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
    marginHorizontal: Spacing.md,
  },
  categoryTabsScroller: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    paddingTop: Spacing.sm,
    paddingRight: Spacing.lg,
    gap: Spacing.xs,
  },
  categoryTabsDivider: {
    height: 1,
    backgroundColor: '#E3E7EC',
    marginHorizontal: Spacing.md,
  },
  categoryTabChip: {
    borderWidth: 1,
    borderColor: '#D0D7D0',
    backgroundColor: '#F3F6F3',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  categoryTabChipActive: {
    borderColor: '#8B9D8A',
    backgroundColor: '#8B9D8A',
  },
  categoryTabChipText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: '#4B5B4B',
    maxWidth: 110,
  },
  categoryTabChipTextActive: {
    color: '#FFFFFF',
  },
  categorySection: {
    marginBottom: Spacing.lg,
  },
  categoryHeaderRow: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    paddingHorizontal: 0,
    paddingVertical: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: Spacing.sm,
  },
  categoryTitle: {
    color: '#4B5563',
    fontSize: 16,
    lineHeight: 22,
  },
  categoryCountBadge: {
    minWidth: 0,
    height: 'auto',
    borderRadius: 0,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  categoryCountText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '700',
  },
  foodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 12,
    paddingBottom: 20,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 2,
    marginBottom: 10,
  },
  headerLeft: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: Spacing.xs,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    flexShrink: 1,
  },
  stockInline: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: Spacing.xs,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  favButton: {
    minHeight: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    flexDirection: 'row',
    gap: 2,
    paddingHorizontal: 3,
  },
  favoriteCount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5F7F5E',
  },
  cardContentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  imageColumn: {
    width: 90,
  },
  imageWrap: {
    position: 'relative',
  },
  cardImage: {
    width: 90,
    height: 90,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
  },
  floatingAddButton: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    minWidth: 118,
    height: 36,
    borderRadius: 18,
    paddingHorizontal: 12,
    backgroundColor: '#8B9D8A',
    borderWidth: 2,
    borderColor: '#DCE5DC',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6B7A6A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
  floatingAddButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
  },
  cardBody: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: 'space-between',
  },
  cardBodyTop: {
    minHeight: 54,
  },
  foodCategoryBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#CFE3CF',
    backgroundColor: '#EEF7EE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 6,
  },
  foodCategoryBadgeText: {
    color: '#2F5D3A',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  metaTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 4,
  },
  metaDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: '#6B7280',
  },
  metaDeliveryRow: {
    marginTop: 10,
  },
  deliveryInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    justifyContent: 'flex-start',
  },
  deliveryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  deliveryEmoji: {
    fontSize: 14,
    lineHeight: 16,
  },
  deliveryLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: '#6B7280',
  },
  altListSection: {
    marginTop: Spacing.xs,
    paddingBottom: Spacing.md,
  },
  altCategoryGroup: {
    marginBottom: Spacing.sm,
  },
  altCategoryCard: {
    borderWidth: 1,
    borderColor: '#E1E7E1',
    borderRadius: 14,
    marginHorizontal: Spacing.md,
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  altCategoryHeaderCompact: {
    marginHorizontal: 0,
    marginBottom: Spacing.sm,
  },
  altFoodRow: {
    marginHorizontal: 6,
    marginBottom: 0,
    borderTopWidth: 1,
    borderTopColor: '#E3E7EC',
    paddingVertical: 9,
    paddingHorizontal: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  altFoodImage: {
    width: 62,
    height: 62,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  altFoodMain: {
    flex: 1,
    minWidth: 0,
  },
  altTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
    gap: Spacing.xs,
  },
  altStockText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  altFoodName: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '800',
    marginBottom: 5,
  },
  altDeliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  altDeliveryMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  altDeliveryMetaText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: '#67727E',
  },
  altFoodRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 2,
    marginLeft: Spacing.sm,
    minWidth: 76,
  },
  altFoodPrice: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
  },
  commentsTabSection: {
    paddingVertical: Spacing.md,
    paddingHorizontal: 0,
  },
  commentsHeaderRow: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  headerStarFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitleNoMargin: {
    marginHorizontal: 0,
    marginBottom: 0,
  },
  commentsFilterWrap: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  commentFilterChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },
  commentFilterChipActive: {
    borderColor: '#8FA08E',
    backgroundColor: '#E8F2E8',
  },
  commentFilterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  commentFilterChipTextActive: {
    color: '#3C5A3B',
    fontWeight: '700',
  },
  commentSearchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    minHeight: 36,
  },
  commentSearchInput: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    paddingVertical: 7,
    marginLeft: 6,
  },
  commentSearchClear: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  commentsEmpty: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  commentsEmptyText: {
    fontSize: 12,
    color: '#6B7280',
  },
  commentSortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  commentSortLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
    marginRight: 2,
  },
  commentSortChip: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },
  commentSortChipActive: {
    borderColor: '#8FA08E',
    backgroundColor: '#E8F2E8',
  },
  commentSortChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  commentSortChipTextActive: {
    color: '#3C5A3B',
    fontWeight: '700',
  },
  commentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  commentStars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  commentRating: {
    marginLeft: 2,
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  commentFoodName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5F7F5E',
  },
  commentText: {
    fontSize: 12,
    lineHeight: 17,
    color: '#6B7280',
  },
});
