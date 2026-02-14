import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Tabs, router } from 'expo-router';
import { Colors } from '@/src/theme';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useCart } from '@/src/context/CartContext';
import { WebSafeIcon } from '@/src/components/ui/WebSafeIcon';
import { useAuth } from '@/src/context/AuthContext';
import { useTranslation } from '@/src/hooks/useTranslation';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: string;
  color: string;
  style?: any;
}) {
  return (
    <WebSafeIcon 
      name={props.name}
      size={20}
      color={props.color}
      style={{ marginBottom: -2, ...props.style }}
    />
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const { getTotalItems } = useCart();
  const cartItemCount = getTotalItems();
  const { userData } = useAuth();
  // Giris tipi buyer ise buyer akisi, seller ise seller akisi.
  const isSeller = userData?.userType === 'seller';
  const buttonBg = colors.primary;
  const buttonText = colors.card;

  const handleCenterPress = () => {
    if (isSeller) {
      router.push('/(seller)/seller-panel' as any);
      return;
    }
    router.push('/(buyer)' as any);
  };

  const handleProfilePress = () => {
    if (isSeller) {
      router.push('/(seller)/seller-profile' as any);
      return;
    }
    router.push('/(buyer)/buyer-profile' as any);
  };

  const renderCompactTabButton = (props: any, onPressOverride?: () => void) => {
    const {
      onPress,
      onLongPress,
      accessibilityState,
      accessibilityLabel,
      testID,
      style,
      children,
    } = props;

    return (
      <View style={[style, { flex: 1, alignItems: 'center', justifyContent: 'center' }]}>
        <TouchableOpacity
          onPress={onPressOverride || onPress}
          onLongPress={onLongPress}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          accessibilityState={accessibilityState}
          testID={testID}
          activeOpacity={0.7}
          hitSlop={{ top: 0, bottom: 0, left: 0, right: 0 }}
          style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 16 }}
        >
          {children}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Tabs
      screenOptions={{
        swipeEnabled: false, // Disable swipe between tabs
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          paddingTop: 0,
          paddingBottom: 0,
          height: 85,
          overflow: 'visible',
          shadowColor: colors.text,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 8,
        },
        tabBarBackground: () => (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 12,
              backgroundColor: 'transparent',
            }}
          />
        ),
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarBadgeStyle: {
          backgroundColor: colors.error, // Red badge
          color: 'white',
          fontSize: 10,
          minWidth: 18,
          minHeight: 18,
          lineHeight: 18,
          paddingHorizontal: 0,
          paddingVertical: 0,
          borderRadius: 9,
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon 
              name={focused ? "grid-view" : "grid-view"} 
              color={color}
              style={{ fontSize: focused ? 22 : 20 }}
            />
          ),
          tabBarButton: (props) => (
            renderCompactTabButton(props)
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null, // Hide from tab bar - search functionality moved to main page
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: t('tabs.cart'),
          tabBarBadge: cartItemCount > 0 ? cartItemCount : undefined,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon 
              name={focused ? "shopping-cart" : "shopping-cart"} 
              color={color}
              style={{ fontSize: focused ? 22 : 20 }}
            />
          ),
          tabBarButton: (props) => (
            renderCompactTabButton(props)
          ),
        }}
      />
      <Tabs.Screen
        name="buyer-profile"
        options={{
          title: 'C',
          tabBarLabel: () => null,
          tabBarButton: (props) => {
            const {
              onLongPress,
              accessibilityState,
              accessibilityLabel,
              testID,
              style,
            } = props;

            return (
              <View style={[style, { flex: 1, alignItems: 'center', justifyContent: 'center' }]}>
                <TouchableOpacity
                  onPress={handleCenterPress}
                  onLongPress={onLongPress}
                  accessibilityRole="button"
                  accessibilityLabel={accessibilityLabel || t('tabs.profileShortcut')}
                  accessibilityState={accessibilityState}
                  testID={testID}
                  activeOpacity={0.8}
                  style={{ flex: 1, alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
                >
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      backgroundColor: buttonBg,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 2,
                      borderColor: colors.card,
                      shadowColor: colors.text,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.12,
                      shadowRadius: 6,
                      elevation: 6,
                      zIndex: 10,
                    }}
                  >
                    <Text
                      style={{
                        color: buttonText,
                        fontSize: 22,
                        fontWeight: '700',
                      }}
                    >
                      C
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            );
          },
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: t('tabs.messages'),
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon 
              name={focused ? "email" : "email"} 
              color={color}
              style={{ fontSize: focused ? 22 : 20 }}
                  />
          ),
          tabBarButton: (props) => (
            renderCompactTabButton(props)
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon 
              name="person" 
              color={color}
              style={{ fontSize: focused ? 22 : 20, transform: [{ translateY: -4 }] }}
            />
          ),
          tabBarButton: (props) => (
            renderCompactTabButton(props, handleProfilePress)
          ),
        }}
      />
      <Tabs.Screen
        name="seller"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      {/* Hidden screens - accessible via navigation but not in tabs */}
      <Tabs.Screen
        name="orders"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="order-confirmation"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="chat-list"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="chat-detail"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="payment"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="order-tracking"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}
