import { ApiRequest, ApiResponse } from '../types';
import { userModel } from '../models/userModel';

export const authController = {
  register: async (req: ApiRequest): Promise<ApiResponse> => {
    try {
      const { uid, email, displayName, userType, password } = req.body;
      
      const existingUser = await userModel.findByEmail(email);
      if (existingUser) {
        return { status: 400, error: 'Email already in use' };
      }

      const newUser = {
        uid,
        email,
        displayName,
        userType,
        password, // In a real app, hash this!
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
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
  }
};
