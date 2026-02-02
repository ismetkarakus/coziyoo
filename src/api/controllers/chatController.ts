import { ApiRequest, ApiResponse } from '../types';
import { chatModel } from '../models/chatModel';
import { messageModel } from '../models/messageModel';

export const chatController = {
  list: async (req: ApiRequest): Promise<ApiResponse> => {
    try {
      const { userId } = req.query;
      const chats = await chatModel.findByUser(userId);
      return { status: 200, data: chats };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  },

  getMessages: async (req: ApiRequest): Promise<ApiResponse> => {
    try {
      const { id } = req.params;
      const messages = await messageModel.findByChatId(id);
      return { status: 200, data: messages };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  },

  sendMessage: async (req: ApiRequest): Promise<ApiResponse> => {
    try {
      const { chatId } = req.params;
      const messageData = req.body;
      
      await messageModel.create(messageData);
      
      // Update chat last message
      await chatModel.updateLastMessage(
          chatId, 
          messageData.message, 
          messageData.timestamp, 
          messageData.senderId
      );

      return { status: 201, data: messageData };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  },

  create: async (req: ApiRequest): Promise<ApiResponse> => {
    try {
        const chatData = req.body;
        // Check existing
        const existing = await chatModel.findExisting(chatData.buyerId, chatData.sellerId);
        if (existing) {
            return { status: 200, data: existing };
        }
        
        await chatModel.create(chatData);
        return { status: 201, data: chatData };
    } catch (error: any) {
        return { status: 500, error: error.message };
    }
  }
};
