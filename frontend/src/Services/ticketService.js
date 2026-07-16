import apiClient from "./apiClient";
import { API_URL } from "./config";

const BASE_URL = `${API_URL}/tickets`;

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

  async addMessage(ticketId, content, files = []) {
    const formData = new FormData();
    formData.append("content", content);
    files.forEach((file) => {
      formData.append("files", file);
    });

    const res = await apiClient(`${BASE_URL}/${ticketId}/messages`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw await res.json();
    return await res.json();
  },
};

export default ticketService;