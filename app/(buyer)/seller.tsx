import { router } from 'expo-router';
import { useEffect } from 'react';

export default function SellerScreen() {
  useEffect(() => {
    // Redirect to sellers panel
    router.replace('/(seller)/seller-panel');
  }, []);

  return null; // This component just redirects
}
















