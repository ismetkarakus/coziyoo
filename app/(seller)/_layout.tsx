import { Stack } from 'expo-router';

export default function SellerLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="dashboard" 
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="add-meal" 
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="orders" 
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="products" 
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="analytics" 
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="meal-preview" 
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="profile" 
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="earnings" 
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="messages" 
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="delivery-settings" 
        options={{ 
          headerShown: false,
        }} 
      />
    </Stack>
  );
}

