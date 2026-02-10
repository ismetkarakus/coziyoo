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
        name="edit-meal" 
        options={{ 
          headerShown: false,
          animation: 'slide_from_right',
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
        name="seller-profile" 
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
      <Stack.Screen 
        name="manage-meals" 
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="wallet" 
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="ratings" 
        options={{ 
          headerShown: false,
        }} 
      />
    </Stack>
  );
}
