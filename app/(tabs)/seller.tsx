import { router } from 'expo-router';
import { useEffect } from 'react';

export default function SellerScreen() {
  useEffect(() => {
    // Redirect to seller dashboard
    router.replace('/(seller)/dashboard');
  }, []);

  return null; // This component just redirects
}











