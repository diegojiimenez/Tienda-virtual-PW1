import api from './api';

class AdminUserService {
  async getAllUsers(filters = {}) {
    const response = await api.get('/admin/users', { params: filters });
    return response.data;
  }

  async getUserStats() {
    const response = await api.get('/admin/users/stats');
    return response.data;
  }

  async getUserById(id) {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  }

  async createUser(userData) {
    const response = await api.post('/admin/users', userData);
    return response.data;
  }

  async deleteUser(id) {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  }
}

export default new AdminUserService();