import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import Column from './Column';
import Card from './Card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import useBoardStore from '../../store/useBoardStore';

/**
 * Board Component
 * Kanban board with drag-and-drop columns and cards
 */
const Board = ({ boardId }) => {
  const { columns, cards, moveCard, addColumn } = useBoardStore();
  const [activeCard, setActiveCard] = useState(null);

  // Demo data if no columns exist
  const demoColumns = columns.length > 0 ? columns : [
    { id: 'todo', title: 'To Do', color: 'bg-gray-500' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-blue-500' },
    { id: 'review', title: 'Review', color: 'bg-purple-500' },
    { id: 'done', title: 'Done', color: 'bg-green-500' },
  ];

  const demoCards = cards.length > 0 ? cards : [
    {
      id: '1',
      columnId: 'todo',
      title: 'Design new landing page',
      description: 'Create mockups for the new landing page',
      priority: 'high',
      assignee: { name: 'Sarah Chen', avatar: null },
    },
    {
      id: '2',
      columnId: 'todo',
      title: 'Update documentation',
      description: 'Add API documentation for new endpoints',
      priority: 'medium',
      assignee: { name: 'Mike Johnson', avatar: null },
    },
    {
      id: '3',
      columnId: 'in-progress',
      title: 'Implement user authentication',
      description: 'Add JWT-based authentication',
      priority: 'high',
      assignee: { name: 'Emily Davis', avatar: null },
    },
    {
      id: '4',
      columnId: 'review',
      title: 'Fix responsive layout',
      description: 'Mobile layout needs adjustments',
      priority: 'low',
      assignee: { name: 'Alex Kim', avatar: null },
    },
    {
      id: '5',
      columnId: 'done',
      title: 'Setup CI/CD pipeline',
      description: 'Configure GitHub Actions',
      priority: 'medium',
      assignee: { name: 'Sarah Chen', avatar: null },
    },
  ];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    const card = demoCards.find((c) => c.id === active.id);
    setActiveCard(card);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) return;

    const activeCard = demoCards.find((c) => c.id === active.id);
    const overColumn = demoColumns.find((col) => col.id === over.id);

    if (activeCard && overColumn && activeCard.columnId !== overColumn.id) {
      moveCard(active.id, activeCard.columnId, overColumn.id, 0);
    }

    setActiveCard(null);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Board header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Project Board</h2>
          <p className="text-sm text-muted-foreground">
            Drag and drop cards to update their status
          </p>
        </div>
        <Button onClick={() => addColumn({ id: Date.now().toString(), title: 'New Column', color: 'bg-gray-500' })}>
          <Plus className="mr-2 h-4 w-4" />
          Add Column
        </Button>
      </div>

      {/* Kanban board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {demoColumns.map((column) => (
            <Column
              key={column.id}
              column={column}
              cards={demoCards.filter((card) => card.columnId === column.id)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeCard ? <Card card={activeCard} isDragging /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default Board;
