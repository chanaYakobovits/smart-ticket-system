import apiClient from "./apiClient";

const BASE_URL = "http://localhost:8000/api/tickets";

const ticketService = {
  async getTicketsByUser(userId) {
    const res = await apiClient(`${BASE_URL}/user/${userId}`);
    if (!res.ok) throw await res.json();
    return await res.json();
  },

  async getTicketById(ticketId) {
    const res = await apiClient(`${BASE_URL}/${ticketId}`);
    if (!res.ok) throw await res.json();
    return await res.json();
  },

  async addTicket(formData) {
    const res = await apiClient(BASE_URL, {
      method: "POST",
      body: formData
  });

    if (!res.ok) throw await res.json();
    return await res.json();
  },
};

export default ticketService;