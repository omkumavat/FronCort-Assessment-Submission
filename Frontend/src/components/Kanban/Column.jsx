import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import Card from './Card';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Column Component
 * Kanban column containing cards
 */
const Column = ({ column, cards }) => {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <div className="flex w-80 flex-shrink-0 flex-col rounded-lg border bg-muted/30">
      {/* Column header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <div className={cn('h-3 w-3 rounded-full', column.color)} />
          <h3 className="font-semibold">{column.title}</h3>
          <span className="text-sm text-muted-foreground">
            {cards.length}
          </span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Cards */}
      <SortableContext
        id={column.id}
        items={cards.map((card) => card.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className="flex-1 space-y-2 p-4 min-h-[200px]"
        >
          {cards.map((card) => (
            <Card key={card.id} card={card} />
          ))}
        </div>
      </SortableContext>

      {/* Add card button */}
      <div className="p-4 border-t">
        <Button variant="ghost" className="w-full justify-start" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add card
        </Button>
      </div>
    </div>
  );
};

export default Column;
