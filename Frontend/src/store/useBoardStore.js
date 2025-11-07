import { create } from 'zustand';

/**
 * Board Store - Manages Kanban board state
 * 
 * State:
 * - currentBoard: Currently open board
 * - columns: Board columns
 * - cards: All cards
 * - filters: Active filters
 * 
 * Actions:
 * - setBoard: Set current board
 * - addColumn: Add a new column
 * - updateColumn: Update column
 * - deleteColumn: Delete column
 * - addCard: Add a new card
 * - updateCard: Update card
 * - deleteCard: Delete card
 * - moveCard: Move card between columns
 * - setFilters: Set active filters
 */
const useBoardStore = create((set) => ({
  // State
  currentBoard: null,
  columns: [],
  cards: [],
  filters: {},

  // Actions
  setBoard: (board) => 
    set({ 
      currentBoard: board, 
      columns: board?.columns || [],
      cards: board?.cards || [],
    }),

  addColumn: (column) => 
    set((state) => ({
      columns: [...state.columns, column],
    })),

  updateColumn: (columnId, updates) => 
    set((state) => ({
      columns: state.columns.map(col => 
        col.id === columnId ? { ...col, ...updates } : col
      ),
    })),

  deleteColumn: (columnId) => 
    set((state) => ({
      columns: state.columns.filter(col => col.id !== columnId),
      cards: state.cards.filter(card => card.columnId !== columnId),
    })),

  addCard: (card) => 
    set((state) => ({
      cards: [...state.cards, card],
    })),

  updateCard: (cardId, updates) => 
    set((state) => ({
      cards: state.cards.map(card => 
        card.id === cardId ? { ...card, ...updates } : card
      ),
    })),

  deleteCard: (cardId) => 
    set((state) => ({
      cards: state.cards.filter(card => card.id !== cardId),
    })),

  moveCard: (cardId, sourceColumnId, destinationColumnId, newIndex) => 
    set((state) => {
      const card = state.cards.find(c => c.id === cardId);
      if (!card) return state;

      const updatedCards = state.cards.map(c => 
        c.id === cardId 
          ? { ...c, columnId: destinationColumnId, order: newIndex } 
          : c
      );

      return { cards: updatedCards };
    }),

  setFilters: (filters) => 
    set({ filters }),
}));

export default useBoardStore;
