import { getDB } from '../utils/db';

export interface User {
  uid: string;
  email: string;
  fullName?: string;
  displayName: string;
  username?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  avatarUri?: string;
  addressLine1?: string;
  city?: string;
  postcode?: string;
  allergicTo?: string;
  paymentCards?: string;
  sellerNickname?: string;
  sellerLocation?: string;
  sellerAddress?: string;
  sellerDescription?: string;
  sellerDeliveryDistance?: string;
  sellerSpecialties?: string;
  identityFrontImage?: string;
  identityBackImage?: string;
  identityStatus?: string;
  identitySubmittedAt?: string;
  identityVerifiedAt?: string;
  identityRejectionReason?: string;
  bankName?: string;
  bankAccountHolderName?: string;
  bankIban?: string;
  bankAccountNumber?: string;
  complianceCouncilRegistered?: number;
  complianceHygieneCertificate?: number;
  complianceAllergensDeclared?: number;
  complianceHygieneRating?: number;
  complianceInsurance?: number;
  complianceTermsAccepted?: number;
  complianceApproved?: number;
  complianceData?: string;
  userType: 'buyer' | 'seller' | 'both';
  password?: string;
  createdAt: string;
  updatedAt: string;
}

export const userModel = {
  findById: async (uid: string): Promise<User | null> => {
    const db = getDB();
    const result = await db.getFirstAsync('SELECT * FROM users WHERE uid = ?', [uid]);
    return result as User | null;
  },

  findByEmail: async (email: string): Promise<User | null> => {
    const db = getDB();
    const result = await db.getFirstAsync('SELECT * FROM users WHERE email = ?', [email]);
    return result as User | null;
  },

  findByUsername: async (username: string): Promise<User | null> => {
    const db = getDB();
    const result = await db.getFirstAsync('SELECT * FROM users WHERE username = ?', [username]);
    return result as User | null;
  },

  create: async (user: User): Promise<void> => {
    const db = getDB();
    await db.runAsync(
      `INSERT INTO users (
        uid, email, fullName, displayName, username, phone, birthDate, gender, avatarUri,
        addressLine1, city, postcode, allergicTo, paymentCards,
        sellerNickname, sellerLocation, sellerAddress, sellerDescription, sellerDeliveryDistance, sellerSpecialties,
        identityFrontImage, identityBackImage, identityStatus, identitySubmittedAt, identityVerifiedAt, identityRejectionReason,
        bankName, bankAccountHolderName, bankIban, bankAccountNumber,
        complianceCouncilRegistered, complianceHygieneCertificate, complianceAllergensDeclared, complianceHygieneRating,
        complianceInsurance, complianceTermsAccepted, complianceApproved, complianceData,
        userType, password, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.uid,
        user.email || '',
        user.fullName || '',
        user.displayName || '',
        user.username || '',
        user.phone || '',
        user.birthDate || '',
        user.gender || '',
        user.avatarUri || '',
        user.addressLine1 || '',
        user.city || '',
        user.postcode || '',
        user.allergicTo || '',
        user.paymentCards || '',
        user.sellerNickname || '',
        user.sellerLocation || '',
        user.sellerAddress || '',
        user.sellerDescription || '',
        user.sellerDeliveryDistance || '',
        user.sellerSpecialties || '',
        user.identityFrontImage || '',
        user.identityBackImage || '',
        user.identityStatus || '',
        user.identitySubmittedAt || '',
        user.identityVerifiedAt || '',
        user.identityRejectionReason || '',
        user.bankName || '',
        user.bankAccountHolderName || '',
        user.bankIban || '',
        user.bankAccountNumber || '',
        Number(user.complianceCouncilRegistered ?? 0),
        Number(user.complianceHygieneCertificate ?? 0),
        Number(user.complianceAllergensDeclared ?? 0),
        Number(user.complianceHygieneRating ?? 0),
        Number(user.complianceInsurance ?? 0),
        Number(user.complianceTermsAccepted ?? 0),
        Number(user.complianceApproved ?? 0),
        user.complianceData || '',
        user.userType,
        user.password || '',
        user.createdAt,
        user.updatedAt,
      ]
    );
  },

  update: async (uid: string, updates: Partial<User>): Promise<void> => {
    const db = getDB();
    const fields = Object.keys(updates).filter(k => k !== 'uid').map(k => `${k} = ?`).join(', ');
    const values = Object.keys(updates).filter(k => k !== 'uid').map(k => (updates as any)[k]);
    
    if (fields.length === 0) return;

    await db.runAsync(`UPDATE users SET ${fields} WHERE uid = ?`, [...values, uid]);
  }
};
