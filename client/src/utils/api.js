const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    // Add auth headers if user is logged in
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (user) {
      config.headers.userId = user.id;
      config.headers.userRole = user.role;
    }

    console.log('🌐 API Request:', {
      url,
      headers: config.headers,
      method: config.method || 'GET'
    });

    try {
      const response = await fetch(url, config);
      
      console.log('📡 API Response Status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ API Success Response:', data);
      return data;
    } catch (error) {
      console.error(`❌ API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Auth methods
  async login(email, password) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async register(name, email, password, role = "user") {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role }),
    });
  }

  // Product methods
  async getProducts(filters = {}) {
    const params = new URLSearchParams();

    Object.keys(filters).forEach((key) => {
      if (
        filters[key] !== undefined &&
        filters[key] !== null &&
        filters[key] !== ""
      ) {
        params.append(key, filters[key]);
      }
    });

    const queryString = params.toString();
    const endpoint = queryString ? `/products?${queryString}` : "/products";

    return this.request(endpoint);
  }

  async getCategories() {
    return this.request("/products/categories");
  }

  async getPriceRange() {
    return this.request("/products/price-range");
  }

  async getProduct(id) {
    return this.request(`/products/${id}`);
  }

  async createProduct(productData) {
    return this.request("/products", {
      method: "POST",
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id, productData) {
    return this.request(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id) {
    return this.request(`/products/${id}`, {
      method: "DELETE",
    });
  }

  // Order methods
  async createOrder(orderData) {
    return this.request("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  }

  async getUserOrders(userId) {
    console.log('🔍 Getting orders for userId:', userId);
    if (!userId) {
      throw new Error('User ID is required to fetch orders');
    }
    return this.request(`/orders/user/${userId}`);
  }

  async getAllOrders() {
    return this.request("/orders");
  }

  async updateOrderStatus(orderId, status) {
    return this.request(`/orders/${orderId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  }

  // Payment methods
  async createPaymentIntent(amount, currency = "usd") {
    return this.request("/create-payment-intent", {
      method: "POST",
      body: JSON.stringify({ amount, currency }),
    });
  }

  async confirmPayment(paymentIntentId, orderId) {
    return this.request("/confirm-payment", {
      method: "POST",
      body: JSON.stringify({ paymentIntentId, orderId }),
    });
  }

  // ADD THIS NEW METHOD FOR ADMIN SEEDING
  async seedProducts() {
    return this.request("/seed", {
      method: "POST",
    });
  }
}

export const apiClient = new ApiClient();