import { useEffect, useState } from 'react';
import axios from 'axios';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  FileText,
  MessageSquare,
  CheckCircle,
  User,
  LayoutDashboard,
  MoveRight,
  Link2,
  Loader2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

const ActivityFeed = ({ projectId, refreshKey }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch activities for this project
  useEffect(() => {
    // if (!projectId) return;
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `https://froncort-assessment-submission.onrender.com/server/projects/activity/fetch/${projectId}`
        );
        console.log(res.data);
        
        setActivities(res.data || []);
        // fetchProject();
      } catch (err) {
        console.error('Error fetching activities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [projectId, refreshKey]);

  // Get Icon by type
  const getActivityIcon = (type) => {
    const icons = {
      page_create: FileText,
      card_create: CheckCircle,
      card_move: MoveRight,
      board_create: LayoutDashboard,
      page_link: Link2,
      comment: MessageSquare,
      user: User,
    };
    const Icon = icons[type] || FileText;
    return <Icon className="h-4 w-4" />;
  };

  // Get color by type
  const getActivityColor = (type) => {
    const colors = {
      page_create: 'bg-blue-500',
      card_create: 'bg-green-500',
      card_move: 'bg-yellow-500',
      board_create: 'bg-purple-500',
      page_link: 'bg-pink-500',
      comment: 'bg-orange-500',
      user: 'bg-gray-500',
    };
    return colors[type] || 'bg-gray-400';
  };

  const getActivitySentence = (activity) => {
    const name = activity?.userName || 'Someone';
    const target = activity?.target ? `"${activity.target}"` : '';

    switch (activity.actionType) {
      case 'page_create':
        return `${name} created a new page ${target}`;
      case 'card_create':
        return `${name} created a new card ${target}`;
      case 'card_edit':
        return `${name} updated card ${target}`;
      case 'card_delete':
        return `${name} deleted card ${target}`;
      case 'card_move':
        // optionally show from → to columns if present
        // if (activity.from && activity.to) {
        // return `${name} moved card ${target} from ${activity.from} → ${activity.to}`;
        // }
        return `${name} moved card ${target}`;
      case 'board_create':
        return `${name} created a new board ${target}`;
      case 'board_delete':
        return `${name} deleted board ${target}`;
      case 'page_link':
        return `${name} linked page ${target}`;
      // case 'comment':
      //   return `${name} commented on ${target}`;
      case 'user':
        return `${name} joined the project`;
      default:
        return `${name} performed an action ${target}`;
    }
  };

  // Empty state animation
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-[380px] text-center text-muted-foreground space-y-3">
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
        className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 shadow-inner"
      >
        <Loader2 className="w-8 h-8 text-gray-400" />
      </motion.div>
      <p className="font-semibold text-gray-500">No recent activity yet</p>
      <p className="text-sm">Start by creating a page, card, or board to see updates here!</p>
    </div>
  );

  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b p-4">
        <h3 className="font-semibold">Recent Activities</h3>
      </div>

      <ScrollArea className="h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-[380px]">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : activities.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="p-4 space-y-4">
            {[...activities].reverse().map((activity, idx) => (
              <motion.div
                key={activity._id || idx}
                className="flex gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={activity?.avatarUrl} />
                  <AvatarFallback className="text-xs">
                    {activity?.userName || 'U'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-1">
                  <div className="flex items-start gap-2">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full ${getActivityColor(
                        activity.type
                      )} text-white`}
                    >
                      {getActivityIcon(activity.actionType)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{getActivitySentence(activity)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(
                          new Date(activity.timestamp || activity.createdAt),
                          { addSuffix: true }
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        )}
      </ScrollArea>
    </div>
  );
};

export default ActivityFeed;
