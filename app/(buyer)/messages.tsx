import { ChatList } from '@/src/features/chat/screens';
import { SellerMessages } from '@/src/features/seller/screens';
import { useAuth } from '@/src/context/AuthContext';

export default function MessagesTab() {
  const { userData } = useAuth();
  // Buyer tabinda "both" kullanici da alici mesajlarini gormeli.
  const isSellerOnly = userData?.userType === 'seller';

  if (isSellerOnly) {
    return <SellerMessages />;
  }

  return <ChatList />;
}






