import { create } from 'zustand';
import axios from 'axios';

import { initUser } from '../lib/auth'; // e.g. "User-123"
const user = initUser();

export const useEditorStore = create((set, get) => ({
  pages: {},

  // Set or update a page in local store
  setPage: (pageId, page) =>
    set((state) => ({ pages: { ...state.pages, [pageId]: page } })),

  // Get page by ID
  getPage: (pageId) => get().pages[pageId],

  // Get all pages as array
  getAllPages: () => Object.values(get().pages || {}),

  createPage: async (title) => {
    try {
      const res = await axios.post('https://froncort-assessment-submission.onrender.com/server/pages/create', { title, authorId: user.name,avatar:user.avatar });
      const newPage = res.data.page;
      get().setPage(newPage._id, newPage);
      return newPage._id;
    } catch (err) {
      console.error('Failed to create page:', err);
      alert('Failed to create page');
      return null;
    }
  },

  // ✅ Fetch all pages from backend
  fetchAllPages: async () => {
    try {
      const res = await axios.get(`https://froncort-assessment-submission.onrender.com/server/pages/getall/${user.name}`);
      const pag = res.data.page;
      const pagesMap = {};
      pag.forEach((p) => (pagesMap[p._id] = p));
      set({ pages: pagesMap });
    } catch (err) {
      console.error('Failed to fetch pages:', err);
    }
  },
}));
