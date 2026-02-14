import { ChatList } from '@/src/features/buyer/screens';
import { SellerMessages } from '@/src/features/seller/screens';
import { useAuth } from '@/src/context/AuthContext';

export default function MessagesTab() {
  const { userData } = useAuth();
  const isSeller =
    userData?.userType === 'seller' ||
    userData?.userType === 'both' ||
    (userData as any)?.sellerEnabled === true;

  if (isSeller) {
    return <SellerMessages />;
  }

  return <ChatList />;
}








