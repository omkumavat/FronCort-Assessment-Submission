import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { GripVertical, MessageSquare, Paperclip } from 'lucide-react';

/**
 * Card Component
 * Draggable Kanban card
 */
const Card = ({ card, isDragging }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500',
    };
    return colors[priority] || 'bg-gray-500';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        'kanban-card group',
        (isDragging || isSortableDragging) && 'opacity-50'
      )}
    >
      {/* Drag handle */}
      <div
        {...listeners}
        className="absolute -left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>

      {/* Priority indicator */}
      <div className={cn('absolute top-0 left-0 w-full h-1 rounded-t-lg', getPriorityColor(card.priority))} />

      {/* Card content */}
      <div className="space-y-3">
        <h4 className="font-medium leading-snug">{card.title}</h4>
        
        {card.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {card.description}
          </p>
        )}

        {/* Card footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {card.comments || 0}
            </span>
            <span className="flex items-center gap-1">
              <Paperclip className="h-3 w-3" />
              {card.attachments || 0}
            </span>
          </div>

          {/* Assignee */}
          {card.assignee && (
            <Avatar className="h-6 w-6">
              <AvatarImage src={card.assignee.avatar} />
              <AvatarFallback className="text-xs">
                {card.assignee.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          )}
        </div>

        {/* Tags */}
        {card.tags && card.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {card.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;
