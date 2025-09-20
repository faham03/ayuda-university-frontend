import api from "./axios";

// ========================
// AUTHENTIFICATION
// ========================
export async function login(credentials) {
  const res = await api.post("users/login/", credentials);
  return res.data;
}

export async function register(userData) {
  const res = await api.post("users/register/", userData);
  return res.data;
}

export async function getProfile() {
  const res = await api.get("users/profile/");
  return res.data;
}

// ========================
// EMPLOI DU TEMPS
// ========================
export async function fetchSchedule(filters = {}) {
  const params = new URLSearchParams();
  
  if (filters.filiere) params.append('filiere', filters.filiere);
  if (filters.year) params.append('year', filters.year);
  if (filters.day) params.append('day', filters.day);
  
  const queryString = params.toString();
  const url = queryString ? `schedule/?${queryString}` : 'schedule/';
  
  const res = await api.get(url);
  return res.data;
}

// Admin: CRUD complet emploi du temps
export async function createSchedule(data) {
  const res = await api.post("schedule-admin/", data);
  return res.data;
}

export async function updateSchedule(id, data) {
  const res = await api.patch(`schedule-admin/${id}/`, data);
  return res.data;
}

export async function deleteSchedule(id) {
  const res = await api.delete(`schedule-admin/${id}/`);
  return res.data;
}

// ========================
// NOTES
// ========================
export async function fetchGrades() {
  const res = await api.get("grades/");
  return res.data;
}

// Admin: Créer/modifier notes
export async function createGrade(data) {
  const res = await api.post("grades/", data);
  return res.data;
}

export async function updateGrade(id, data) {
  const res = await api.patch(`grades/${id}/`, data);
  return res.data;
}

export async function deleteGrade(id) {
  const res = await api.delete(`grades/${id}/`);
  return res.data;
}

// ========================
// ÉVÉNEMENTS
// ========================
export async function fetchEvents() {
  const res = await api.get("events/");
  return res.data;
}

export async function createEvent(data) {
  const res = await api.post("events/", data);
  return res.data;
}

export async function updateEvent(id, data) {
  const res = await api.patch(`events/${id}/`, data);
  return res.data;
}

export async function deleteEvent(id) {
  const res = await api.delete(`events/${id}/`);
  return res.data;
}

export async function fetchReclamations() {
  const res = await api.get("reclamations/");
  return res.data;
}

export async function createReclamation(data) {
  const res = await api.post("reclamations/", data);
  return res.data;
}

export async function updateReclamation(id, data) {
  const res = await api.patch(`reclamations/${id}/`, data);
  return res.data;
}


export async function fetchStudentRequests() {
  const res = await api.get("student/");
  return res.data;
}

export async function createStudentRequest(data) {
  const res = await api.post("student/", data);
  return res.data;
}


export async function fetchAdminRequests() {
  const res = await api.get("admin/");
  return res.data;
}

export async function updateRequest(id, data) {
  const res = await api.patch(`admin/${id}/`, data);
  return res.data;
}


export async function fetchUsers() {
  const res = await api.get("users/students/");
  return res.data;
}

/*export async function fetchUsers() {
  const res = await api.get("users/"); // Endpoint à créer côté Django
  return res.data;
}*/


export async function fetchAdminStats() {
  // Endpoint à créer côté Django pour les statistiques
  const res = await api.get("admin/stats/"); 
  return res.data;
}