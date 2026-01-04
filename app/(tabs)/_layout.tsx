import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { Colors } from '@/src/theme';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useCart } from '@/src/context/CartContext';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
  style?: any;
}) {
  return <FontAwesome size={20} style={{ marginBottom: -2, ...props.style }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { getTotalItems } = useCart();
  const cartItemCount = getTotalItems();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          paddingTop: 12,
          paddingBottom: 12,
          height: 85,
          shadowColor: colors.text,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 8,
        },
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
          title: 'Ana Sayfa',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon 
              name={focused ? "list" : "list"} 
              color={color}
              style={{ fontSize: focused ? 22 : 20 }}
            />
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
          title: 'Sepet',
          tabBarBadge: cartItemCount > 0 ? cartItemCount : undefined,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon 
              name={focused ? "shopping-cart" : "shopping-cart"} 
              color={color}
              style={{ fontSize: focused ? 22 : 20 }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Bildirimler',
          tabBarBadge: 2, // Mock notification count
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon 
              name={focused ? "bell" : "bell-o"} 
              color={color}
              style={{ fontSize: focused ? 22 : 20 }}
            />
          ),
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
        name="profile"
        options={{
          href: null, // Hide from tab bar
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
        name="food-detail"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="category-foods"
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
    </Tabs>
  );
}
