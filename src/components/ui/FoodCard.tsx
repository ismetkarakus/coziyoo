import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ImageSourcePropType,
  ViewStyle,
  useWindowDimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "../../hooks/useTranslation";
import { useCountry } from "../../context/CountryContext";
import { AllergenId } from "../../constants/allergens";
import { getFavoriteMeta, toggleFavorite } from "../../services/favoriteService";

type DeliveryMode = "pickup" | "delivery";

const getCategoryImage = (category?: string) => {
  const categoryImages: { [key: string]: string } = {
    "Ana Yemek": "https://images.unsplash.com/photo-1574484284002-952d92456975?w=320&h=280&fit=crop",
    "Main Dish": "https://images.unsplash.com/photo-1574484284002-952d92456975?w=320&h=280&fit=crop",
    Çorba: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=320&h=280&fit=crop",
    Soup: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=320&h=280&fit=crop",
    Kahvaltı: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=320&h=280&fit=crop",
    Breakfast: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=320&h=280&fit=crop",
    Salata: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=320&h=280&fit=crop",
    Salad: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=320&h=280&fit=crop",
    "Tatlı/Kek": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=320&h=280&fit=crop",
    "Dessert/Cake": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=320&h=280&fit=crop",
    Meze: "https://images.unsplash.com/photo-1544025162-d76694265947?w=320&h=280&fit=crop",
    Appetizer: "https://images.unsplash.com/photo-1544025162-d76694265947?w=320&h=280&fit=crop",
    Vejetaryen: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=320&h=280&fit=crop",
    Vegetarian: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=320&h=280&fit=crop",
    Glutensiz: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=320&h=280&fit=crop",
    "Gluten Free": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=320&h=280&fit=crop",
    İçecekler: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=320&h=280&fit=crop",
    Drinks: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=320&h=280&fit=crop",
  };

  return category ? categoryImages[category] : undefined;
};

const getDefaultImage = () =>
  "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=320&h=280&fit=crop";

type FoodCardProps = {
  id: string;
  name: string;
  cookName: string;
  displayCookName?: string;
  rating: number;
  price: number;
  distance: string;
  imageUrl?: string;
  hasPickup?: boolean;
  hasDelivery?: boolean;
  availableDates?: string;
  currentStock?: number;
  dailyStock?: number;
  onAddToCart?: (
    id: string,
    quantity: number,
    deliveryOption?: DeliveryMode
  ) => void | boolean | Promise<void | boolean>;
  maxDeliveryDistance?: number;
  country?: string;
  category?: string;
  isPreview?: boolean;
  allergens?: AllergenId[];
  hygieneRating?: string;
  availableDeliveryOptions?: DeliveryMode[];
  isGridMode?: boolean;
  showAvailableDates?: boolean;
  ingredients?: string[];
  favoriteCount?: number;
  style?: ViewStyle;
};

function Stars({ value }: { value: number }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <View style={styles.starsRow}>
      {Array.from({ length: full }).map((_, i) => (
        <MaterialIcons key={`f-${i}`} name="star" size={16} color={COLORS.star} />
      ))}
      {half && <MaterialIcons name="star-half" size={16} color={COLORS.star} />}
      {Array.from({ length: empty }).map((_, i) => (
        <MaterialIcons key={`e-${i}`} name="star-outline" size={16} color={COLORS.starMuted} />
      ))}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.infoValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function Segmented({
  value,
  onChange,
  allowPickup,
  allowDelivery,
}: {
  value: DeliveryMode;
  onChange?: (v: DeliveryMode) => void;
  allowPickup: boolean;
  allowDelivery: boolean;
}) {
  return (
    <View style={styles.segmentWrap}>
      <Pressable
        onPress={() => allowPickup && onChange?.("pickup")}
        style={[
          styles.segmentBtn,
          value === "pickup" && styles.segmentBtnActive,
          !allowPickup && styles.segmentBtnDisabled,
        ]}
      >
        <MaterialIcons
          name="local-mall"
          size={16}
          color={value === "pickup" ? COLORS.accent : COLORS.textMuted}
        />
        <Text style={[styles.segmentText, value === "pickup" && styles.segmentTextActive]}>
          Alırım
        </Text>
      </Pressable>

      <Pressable
        onPress={() => allowDelivery && onChange?.("delivery")}
        style={[
          styles.segmentBtn,
          value === "delivery" && styles.segmentBtnActive,
          !allowDelivery && styles.segmentBtnDisabled,
        ]}
      >
        <MaterialIcons
          name="local-shipping"
          size={16}
          color={value === "delivery" ? COLORS.accent : COLORS.textMuted}
        />
        <Text style={[styles.segmentText, value === "delivery" && styles.segmentTextActive]}>
          Gelsin
        </Text>
      </Pressable>
    </View>
  );
}

export function FoodCard({
  id,
  name,
  cookName,
  displayCookName,
  rating,
  price,
  distance,
  imageUrl,
  hasPickup = true,
  hasDelivery = false,
  availableDates,
  currentStock,
  dailyStock,
  onAddToCart,
  maxDeliveryDistance,
  country,
  category,
  isPreview = false,
  availableDeliveryOptions,
  showAvailableDates = false,
  favoriteCount = 0,
  style,
}: FoodCardProps) {
  const { t, currentLanguage } = useTranslation();
  const { formatCurrency } = useCountry();
  const { width } = useWindowDimensions();
  const isCompact = width < 380;

  const resolvedCountry = country || (currentLanguage === "en" ? "Turkish" : "Türk");
  const formatCuisine = (value: string) => {
    const normalized = value.trim();
    if (!normalized) return value;
    if (currentLanguage === "en") {
      return /cuisine$/i.test(normalized) ? normalized : `${normalized} cuisine`;
    }
    return /mutfağı$/i.test(normalized) ? normalized : `${normalized} mutfağı`;
  };
  const cuisineLabel = formatCuisine(resolvedCountry);

  const availableOptions = useMemo<DeliveryMode[]>(() => {
    if (availableDeliveryOptions && availableDeliveryOptions.length > 0) {
      return availableDeliveryOptions;
    }
    const options: DeliveryMode[] = [];
    if (hasPickup) options.push("pickup");
    if (hasDelivery) options.push("delivery");
    return options;
  }, [availableDeliveryOptions, hasPickup, hasDelivery]);

  const initialMode: DeliveryMode = availableOptions.includes("pickup")
    ? "pickup"
    : "delivery";

  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>(initialMode);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteTotal, setFavoriteTotal] = useState<number>(Math.max(0, Number(favoriteCount)));

  useEffect(() => {
    let isMounted = true;
    const loadFavoriteState = async () => {
      try {
        const meta = await getFavoriteMeta();
        if (!isMounted) return;
        setIsFavorite(meta.favoriteIds.has(String(id)));
        setFavoriteTotal(Number(meta.favoriteCounts[String(id)] ?? favoriteCount ?? 0));
      } catch (error) {
        console.error("Error loading food card favorite state:", error);
      }
    };

    loadFavoriteState();
    return () => {
      isMounted = false;
    };
  }, [id, favoriteCount]);

  const formatAvailableDates = (value?: string) => {
    if (!value) return t("foodCard.unknownDate");
    const parts = value.split("-").map((part) => part.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const endDate = parts.slice(1).join("-").trim();
      return t("foodCard.endDateInline", { date: endDate });
    }
    return value;
  };

  const dateText = showAvailableDates
    ? formatAvailableDates(availableDates)
    : maxDeliveryDistance
      ? t("foodCard.deliveryDistance", { distance: maxDeliveryDistance })
      : distance;

  const totalStock = dailyStock ?? currentStock ?? 0;
  const remainingStock = currentStock ?? 0;
  const safeRating = Number.isFinite(rating) ? rating : 0;
  const qtyText = t("foodCard.remainingOnly", {
    remaining: Math.max(remainingStock, 0),
  });

  const priceText = formatCurrency(price);

  const resolvedImage =
    typeof imageUrl === "string" && imageUrl.length > 0
      ? imageUrl
      : getCategoryImage(category) || getDefaultImage();

  const imgSource: ImageSourcePropType = { uri: resolvedImage };
  const imageSize = isCompact ? 100 : 130;

  const handleView = () => {
    const route = `/food-detail-order?id=${id}&name=${encodeURIComponent(name)}&cookName=${encodeURIComponent(
      cookName
    )}&imageUrl=${encodeURIComponent(imgSource.uri || "")}&price=${encodeURIComponent(
      String(price)
    )}`;
    router.push(route);
  };

  const handleAddToCart = () => {
    onAddToCart?.(id, 1, deliveryMode);
  };

  const handleToggleFavorite = async () => {
    try {
      const result = await toggleFavorite({
        id: String(id),
        name,
        cookName,
        price,
        rating,
        imageUrl: resolvedImage,
        category: category || (currentLanguage === "en" ? "Main Dish" : "Ana Yemek"),
      });
      setIsFavorite(result.isFavorite);
      setFavoriteTotal(result.favoriteCount);
    } catch (error) {
      console.error("Error toggling food card favorite:", error);
    }
  };

  return (
    <View style={[styles.card, style]}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Pressable onPress={handleView} style={styles.titlePressable}>
            <Text style={styles.title} numberOfLines={2}>
              {name}
            </Text>
          </Pressable>
          <Pressable style={styles.heartInlineBtn} onPress={handleToggleFavorite}>
            <MaterialIcons
              name={isFavorite ? "favorite" : "favorite-border"}
              size={20}
              color={isFavorite ? COLORS.danger : COLORS.textMuted}
            />
            {favoriteTotal > 0 ? <Text style={styles.heartInlineCount}>{favoriteTotal}</Text> : null}
          </Pressable>
          <View style={styles.priceChipInline}>
            <Text style={styles.priceText}>{priceText}</Text>
          </View>
        </View>

        <View style={styles.headerRight} />
      </View>

      {/* BODY */}
      <View style={styles.body}>
        <View style={styles.imageWrap}>
          <Pressable onPress={handleView}>
            <Image source={imgSource} style={[styles.image, { width: imageSize, height: imageSize }]} />
          </Pressable>
          <Pressable onPress={handleAddToCart} style={styles.floatingAddBtn}>
            <MaterialIcons name="add" size={26} color={COLORS.accent} />
          </Pressable>
        </View>

        <View style={styles.bodyRight}>
          <View style={[styles.infoGrid, { minHeight: imageSize }]}>
            <InfoRow label={t("foodCard.dateLabel")} value={dateText} />
            <InfoRow label={t("foodCard.countryLabel")} value={cuisineLabel} />
            <InfoRow label={t("foodCard.quantityLabel")} value={qtyText} />
            <InfoRow
              label={t("foodCard.deliveryLabel")}
              value={
                availableOptions.includes("pickup") && availableOptions.includes("delivery")
                  ? t("foodCard.availablePickupDeliveryMultiline")
                : availableOptions.includes("pickup")
                  ? t("foodCard.availablePickupOnly")
                  : t("foodCard.availableDeliveryOnly")
              }
            />
          </View>
        </View>
      </View>

      <View style={styles.footerMeta}>
        <Pressable
          onPress={() =>
            router.push(`/seller-public-profile?cookName=${encodeURIComponent(cookName)}`)
          }
        >
          <Text style={styles.seller} numberOfLines={1}>
            {(displayCookName || cookName)} →
          </Text>
        </Pressable>
        <View style={styles.footerRating}>
          <Stars value={rating} />
          <Text style={styles.footerRatingText}>{safeRating.toFixed(1)}</Text>
        </View>
      </View>
    </View>
  );
}

const COLORS = {
  bg: "#FFFFFF",
  border: "#E8ECF2",
  text: "#111827",
  textMuted: "#6B7280",
  accent: "#16A34A",
  accentSoft: "#EAF7EF",
  star: "#F5B301",
  starMuted: "#E5E7EB",
  danger: "#EF4444",
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  header: {
    marginBottom: 0,
    gap: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  titlePressable: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
    lineHeight: 24,
  },
  headerRight: {
    height: 0,
  },
  starsRow: { flexDirection: "row", alignItems: "center" },

  priceChip: {
    backgroundColor: "#F3F4F6",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  priceChipInline: {
    backgroundColor: "#F3F4F6",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  priceText: { fontSize: 16, fontWeight: "800", color: "#4B5563" },

  body: { flexDirection: "row", gap: 12 },
  imageWrap: {
    position: "relative",
    alignSelf: "flex-start",
  },
  image: {
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
  },
  floatingAddBtn: {
    position: "absolute",
    right: -10,
    bottom: -10,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  bodyRight: { flex: 1 },

  infoGrid: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 10,
    gap: 6,
    backgroundColor: "#FAFAFB",
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  infoLabel: {
    width: 70,
    fontSize: 15,
    color: COLORS.textMuted,
    fontWeight: "700",
    lineHeight: 20,
  },
  infoValue: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    fontWeight: "700",
    lineHeight: 20,
  },

  sectionLabel: {
    marginTop: 10,
    marginBottom: 8,
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: "800",
  },

  segmentWrap: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  segmentBtnActive: { backgroundColor: COLORS.accentSoft },
  segmentBtnDisabled: { opacity: 0.5 },
  segmentText: { fontSize: 14, fontWeight: "800", color: COLORS.textMuted },
  segmentTextActive: { color: COLORS.accent },


  heartInlineBtn: {
    minHeight: 32,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 4,
    flexDirection: "row",
    gap: 3,
  },
  heartInlineCount: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textMuted,
  },

  footerMeta: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  seller: { color: COLORS.textMuted, fontSize: 14, fontWeight: "800" },
  footerRating: { flexDirection: "row", alignItems: "center", gap: 6 },
  footerRatingText: { fontSize: 14, fontWeight: "900", color: COLORS.text },
});
