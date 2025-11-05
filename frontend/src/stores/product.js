import { defineStore } from 'pinia';
import productService from '@/services/ProductService';

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
    filteredProducts: [],
    currentProduct: null,
    loading: false,
    error: null,
    filters: {
      search: '',
      categoria: '',
      talla: '',
      color: '',
      precioMin: null,
      precioMax: null
    }
  }),

  getters: {
    categories: (state) => {
      const cats = [...new Set(state.products.map(p => p.categoria))];
      return cats.filter(Boolean);
    },

    availableSizes: (state) => {
      const sizes = state.products.flatMap(p => p.tallas || []);
      return [...new Set(sizes)].sort();
    },

    availableColors: (state) => {
      const colors = state.products.flatMap(p => p.colores || []);
      return [...new Set(colors)].sort();
    },

    priceRange: (state) => {
      if (state.products.length === 0) return { min: 0, max: 1000 };
      const precios = state.products.map(p => p.precio);
      return {
        min: Math.floor(Math.min(...precios)),
        max: Math.ceil(Math.max(...precios))
      };
    }
  },

  actions: {
    async fetchProducts() {
      this.loading = true;
      this.error = null;

      try {
        const data = await productService.getProducts();
        this.products = data.data || [];
        this.filteredProducts = this.products;
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar productos';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async applyFilters() {
      this.loading = true;
      this.error = null;

      try {
        const params = {};
        
        if (this.filters.search) params.search = this.filters.search;
        if (this.filters.categoria) params.categoria = this.filters.categoria;
        if (this.filters.talla) params.talla = this.filters.talla;
        if (this.filters.color) params.color = this.filters.color;
        if (this.filters.precioMin) params.precioMin = this.filters.precioMin;
        if (this.filters.precioMax) params.precioMax = this.filters.precioMax;

        const data = await productService.filterProducts(params);
        this.filteredProducts = data.data || [];
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al filtrar productos';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    clearFilters() {
      this.filters = {
        search: '',
        categoria: '',
        talla: '',
        color: '',
        precioMin: null,
        precioMax: null
      };
      this.filteredProducts = this.products;
    },

    setFilter(key, value) {
      this.filters[key] = value;
      this.applyFilters();
    }
  }
});