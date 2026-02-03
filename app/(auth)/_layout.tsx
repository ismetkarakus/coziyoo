import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="sign-in"
        options={{ 
          title: 'Sign In',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Welcome',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="user-type-selection" 
        options={{ 
          title: 'User Type',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="buyer-register" 
        options={{ 
          title: 'Buyer Register',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="seller-register" 
        options={{ 
          title: 'Seller Register',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="sign-up" 
        options={{ 
          title: 'Sign Up',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="forgot-password" 
        options={{ 
          title: 'Forgot Password',
          headerShown: false,
        }} 
      />
    </Stack>
  );
}
