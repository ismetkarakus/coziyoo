import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Tabs, router } from 'expo-router';
import { Colors } from '@/src/theme';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useCart } from '@/src/context/CartContext';
import { WebSafeIcon } from '@/src/components/ui/WebSafeIcon';

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
  const { getTotalItems } = useCart();
  const cartItemCount = getTotalItems();

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
              name={focused ? "home" : "home"} 
              color={color}
              style={{ fontSize: focused ? 22 : 20 }}
            />
          ),
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              activeOpacity={0.7}
              style={[props.style, { flex: 1, alignItems: 'center', justifyContent: 'center' }]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              activeOpacity={0.7}
              style={[props.style, { flex: 1, alignItems: 'center', justifyContent: 'center' }]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Mesajlar',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon 
              name={focused ? "comments" : "comments-o"} 
              color={color}
              style={{ fontSize: focused ? 22 : 20 }}
                  />
          ),
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              activeOpacity={0.7}
              style={[props.style, { flex: 1, alignItems: 'center', justifyContent: 'center' }]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Bildirimler',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon 
              name={focused ? "bell" : "bell-o"} 
              color={color}
              style={{ fontSize: focused ? 22 : 20 }}
            />
          ),
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              activeOpacity={0.7}
              style={[props.style, { flex: 1, alignItems: 'center', justifyContent: 'center' }]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            />
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
        name="profile"
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
      <Tabs.Screen
        name="food-detail-simple"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}
