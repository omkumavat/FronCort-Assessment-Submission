// API service for backend calls
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }
  return response.json();
};

const getAuthHeader = () => {
  const user = localStorage.getItem('user');
  if (user) {
    const { token } = JSON.parse(user);
    return { Authorization: `Bearer ${token}` };
  }
  return {};
};

// User APIs
export const fetchUser = async (userId) => {
  const response = await fetch(`${API_URL}/users/${userId}`, {
    headers: getAuthHeader(),
  });
  return handleResponse(response);
};

export const updateUser = async (userId, data) => {
  const response = await fetch(`${API_URL}/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

// Project APIs
export const fetchProjects = async () => {
  const response = await fetch(`${API_URL}/projects`, {
    headers: getAuthHeader(),
  });
  return handleResponse(response);
};

export const fetchProject = async (projectId) => {
  const response = await fetch(`${API_URL}/projects/${projectId}`, {
    headers: getAuthHeader(),
  });
  return handleResponse(response);
};

export const createProject = async (data) => {
  const response = await fetch(`${API_URL}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

// Document APIs
export const fetchDocument = async (documentId) => {
  const response = await fetch(`${API_URL}/documents/${documentId}`, {
    headers: getAuthHeader(),
  });
  return handleResponse(response);
};

export const saveDocument = async (documentId, content) => {
  const response = await fetch(`${API_URL}/documents/${documentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ content }),
  });
  return handleResponse(response);
};

// Board APIs
export const fetchBoard = async (boardId) => {
  const response = await fetch(`${API_URL}/boards/${boardId}`, {
    headers: getAuthHeader(),
  });
  return handleResponse(response);
};

export const updateBoard = async (boardId, data) => {
  const response = await fetch(`${API_URL}/boards/${boardId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

// Activity APIs
export const fetchActivities = async (projectId) => {
  const response = await fetch(`${API_URL}/activities?projectId=${projectId}`, {
    headers: getAuthHeader(),
  });
  return handleResponse(response);
};

export default {
  fetchUser,
  updateUser,
  fetchProjects,
  fetchProject,
  createProject,
  fetchDocument,
  saveDocument,
  fetchBoard,
  updateBoard,
  fetchActivities,
};
