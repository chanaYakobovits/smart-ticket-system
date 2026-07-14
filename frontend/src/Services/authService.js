const BASE_URL = 'http://localhost:8000/api/auth';

const authService = {

  async getUserTypes() {
    const res = await fetch(`${BASE_URL}/user-types`);
    return await res.json();
  },

  async getDepartments() {
    const res = await fetch(`${BASE_URL}/departments`);
    return await res.json();
  },
  async getUsers() {
    const res = await fetch(BASE_URL, { credentials: 'include' });
    return await res.json();
  },
  async addUser(user) {
    const res = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    if (!res.ok) throw await res.json();
    return await res.json();
  },


  async login({ employeeId, password, rememberMe }) {
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: employeeId, password, rememberMe }),

    });
    const data = await res.json();
    if (data?.success) {
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('token', data.token);
      storage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
  },

  getToken() {
    const token =
      localStorage.getItem('token') ||
      sessionStorage.getItem('token');
    return token;
  },

  isLoggedIn() {
    return !!this.getToken();
  },

  async forgotPassword(email) {
    const res = await fetch(`${BASE_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw await res.json();
    return await res.json();
  },

  async resetPassword(token, newPassword) {
    const res = await fetch(`${BASE_URL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, new_password: newPassword }),
    });
    if (!res.ok) throw await res.json();
    return await res.json();
  },
};

export default authService;