import api from './api';

class AdminService {
  async getProductStats() {
    const response = await api.get('/products/stats/overview');
    return response.data;
  }

  async getProductsTable() {
    const response = await api.get('/products/stats/table');
    return response.data;
  }

  async getProductById(id) {
    const response = await api.get(`/products/${id}`);
    return response.data;
  }

  async updateProduct(id, data) {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  }

  async deleteProduct(id) {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }

  async createProduct(data) {
    const response = await api.post('/products', data);
    return response.data;
  }
}

export default new AdminService();