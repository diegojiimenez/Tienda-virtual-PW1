import api from './api';

class ChatService {
  async getUserChats() {
    const response = await api.get('/chats/my-chats');
    return response.data;
  }

  async getOrCreateChat(channel) {
    const response = await api.get(`/chats/${channel}`);
    return response.data;
  }

  async sendMessage(channel, content) {
    const response = await api.post(`/chats/${channel}/message`, { content });
    return response.data;
  }

  async markAsRead(channel) {
    const response = await api.put(`/chats/${channel}/read`);
    return response.data;
  }

  async markAsReadAdmin(userId, channel) {
    const response = await api.put(`/chats/${channel}/read`, { userId });
    return response.data;
  }

  async closeChat(channel) {
    const response = await api.put(`/chats/${channel}/close`);
    return response.data;
  }

  // Admin endpoints
  async getAllChats(filters = {}) {
    const response = await api.get('/chats/admin/all', { params: filters });
    return response.data;
  }

  async getAdminChat(userId, channel) {
    const response = await api.get(`/chats/admin/${userId}/${channel}`);
    return response.data;
  }
}

export default new ChatService();