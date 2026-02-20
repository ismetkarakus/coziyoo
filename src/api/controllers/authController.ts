import { ApiRequest, ApiResponse } from '../types';
import { userModel } from '../models/userModel';

const JSON_FIELDS = new Set(['allergicTo', 'paymentCards', 'sellerSpecialties', 'complianceData']);
const BOOLEAN_FIELDS = new Set([
  'complianceCouncilRegistered',
  'complianceHygieneCertificate',
  'complianceAllergensDeclared',
  'complianceHygieneRating',
  'complianceInsurance',
  'complianceTermsAccepted',
  'complianceApproved',
]);
const ALLOWED_PROFILE_FIELDS = new Set([
  'fullName',
  'displayName',
  'phone',
  'birthDate',
  'gender',
  'avatarUri',
  'addressLine1',
  'city',
  'postcode',
  'allergicTo',
  'paymentCards',
  'sellerNickname',
  'sellerLocation',
  'sellerAddress',
  'sellerDescription',
  'sellerDeliveryDistance',
  'sellerSpecialties',
  'identityFrontImage',
  'identityBackImage',
  'identityStatus',
  'identitySubmittedAt',
  'identityVerifiedAt',
  'identityRejectionReason',
  'bankName',
  'bankAccountHolderName',
  'bankIban',
  'bankAccountNumber',
  'complianceCouncilRegistered',
  'complianceHygieneCertificate',
  'complianceAllergensDeclared',
  'complianceHygieneRating',
  'complianceInsurance',
  'complianceTermsAccepted',
  'complianceApproved',
  'complianceData',
]);

const toTimestampPart = (date: Date): string => {
  return String(date.getTime());
};

const sanitizeIdPart = (value: string, fallback: string): string => {
  const normalized = String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');
  return normalized || fallback;
};

const buildUserUidBase = (prefix: 's' | 'b', fullName: string, displayName: string, createdAt: Date): string => {
  const source = `${fullName || ''}`.trim() || `${displayName || ''}`.trim();
  const parts = source.split(/\s+/).filter(Boolean);
  const firstName = sanitizeIdPart(parts[0] || 'user', 'user');
  const surname = sanitizeIdPart(parts[parts.length - 1] || 'user', 'user');
  return `${prefix}_${firstName}_${surname}_${toTimestampPart(createdAt)}`;
};

const normalizeProfileValue = (key: string, value: unknown): string | number => {
  if (JSON_FIELDS.has(key)) {
    if (value === null || value === undefined || value === '') return '';
    return typeof value === 'string' ? value : JSON.stringify(value);
  }
  if (BOOLEAN_FIELDS.has(key)) {
    return value ? 1 : 0;
  }
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

export const authController = {
  register: async (req: ApiRequest): Promise<ApiResponse> => {
    try {
      const { uid, email, fullName, displayName, userType, password } = req.body;
      
      const existingUser = await userModel.findByEmail(email);
      if (existingUser) {
        return { status: 400, error: 'Email already in use' };
      }

      const createdAt = new Date();
      const normalizedUserType = userType || 'buyer';
      const shouldGenerateSellerId = normalizedUserType === 'seller' || normalizedUserType === 'both';
      let nextUid = uid || `user_${Date.now()}`;

      const base = shouldGenerateSellerId
        ? buildUserUidBase('s', fullName || '', displayName || '', createdAt)
        : buildUserUidBase('b', fullName || '', displayName || '', createdAt);
      nextUid = base;
      let counter = 2;
      while (await userModel.findById(nextUid)) {
        nextUid = `${base}_${counter}`;
        counter += 1;
      }

      const newUser = {
        uid: nextUid,
        email,
        fullName: fullName || displayName,
        displayName: displayName || fullName,
        sellerNickname: shouldGenerateSellerId ? displayName : '',
        identityStatus: 'pending',
        userType: normalizedUserType,
        password, // In a real app, hash this!
        createdAt: createdAt.toISOString(),
        updatedAt: createdAt.toISOString()
      };

      await userModel.create(newUser);
      return { status: 201, data: newUser };
    } catch (error: any) {
        console.error('Register error:', error);
      return { status: 500, error: error.message };
    }
  },

  login: async (req: ApiRequest): Promise<ApiResponse> => {
    try {
      const { email, password } = req.body;
      const user = await userModel.findByEmail(email);

      if (!user || user.password !== password) {
        return { status: 401, error: 'Invalid credentials' };
      }

      return { status: 200, data: user };
    } catch (error: any) {
        console.error('Login error:', error);
      return { status: 500, error: error.message };
    }
  },

  getProfile: async (req: ApiRequest): Promise<ApiResponse> => {
    try {
        const { uid } = req.params;
        const user = await userModel.findById(uid);
        if (!user) return { status: 404, error: 'User not found' };
        return { status: 200, data: user };
    } catch (error: any) {
        return { status: 500, error: error.message };
    }
  },

  updateProfile: async (req: ApiRequest): Promise<ApiResponse> => {
    try {
      const { uid } = req.params;
      const payload = req.body || {};
      const requestedEmail = typeof payload.email === 'string' ? payload.email.trim() : '';

      const existingUser = await userModel.findById(uid);
      if (!existingUser) {
        return { status: 404, error: 'User not found' };
      }

      if (
        requestedEmail &&
        requestedEmail.toLowerCase() !== String(existingUser.email || '').toLowerCase()
      ) {
        const emailOwner = await userModel.findByEmail(requestedEmail);
        if (emailOwner && emailOwner.uid !== uid) {
          return { status: 400, error: 'Email already in use' };
        }
      }

      const updates: Record<string, string | number> = {
        updatedAt: new Date().toISOString(),
      };
      if (requestedEmail) {
        updates.email = requestedEmail;
      }

      Object.entries(payload).forEach(([key, value]) => {
        if (key === 'username' || key === 'uid' || key === 'createdAt' || key === 'updatedAt') return;
        if (!ALLOWED_PROFILE_FIELDS.has(key)) return;
        updates[key] = normalizeProfileValue(key, value);
      });

      await userModel.update(uid, updates);
      const updated = await userModel.findById(uid);
      return { status: 200, data: updated };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  },
};
