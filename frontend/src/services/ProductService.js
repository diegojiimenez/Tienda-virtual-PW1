import api from './api';

class ProductService {
  async getProducts(params = {}) {
    const response = await api.get('/products', { params });
    return response.data;
  }

  async getProduct(id) {
    const response = await api.get(`/products/${id}`);
    return response.data;
  }

  async searchProducts(query) {
    const response = await api.get('/products', {
      params: { search: query }
    });
    return response.data;
  }

  async filterProducts(filters) {
    const response = await api.get('/products', {
      params: filters
    });
    return response.data;
  }
}

export default new ProductService();