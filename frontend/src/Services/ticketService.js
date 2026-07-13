const BASE_URL = 'http://localhost:8000/api/tickets';

const ticketService = {
  async getTicketsByUser(userId) {
    const res = await fetch(`${BASE_URL}/user/${userId}`, { credentials: 'include' });
    if (!res.ok) throw await res.json();
    return await res.json();
  },
};

export default ticketService;