const API_URL = 'http://localhost:3001/api';

export const api = {
  async createUser(user: any) {
    const res = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    return res.json();
  },

  async getUsers() {
    const res = await fetch(`${API_URL}/users`);
    return res.json();
  },

  async createLawyerProfile(profile: any) {
    const res = await fetch(`${API_URL}/lawyer-profiles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    return res.json();
  },

  async createPartnerProfile(profile: any) {
    const res = await fetch(`${API_URL}/partner-profiles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    return res.json();
  },

  async createDiary(diary: any) {
    const res = await fetch(`${API_URL}/diaries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(diary),
    });
    return res.json();
  },

  async getDiaries() {
    const res = await fetch(`${API_URL}/diaries`);
    return res.json();
  },

  async getDiariesByLawyer(lawyerId: string) {
    const res = await fetch(`${API_URL}/diaries/lawyer/${lawyerId}`);
    return res.json();
  },
};
