import { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useSocket } from '../context/SocketContext';

/**
 * useNotifications - Hook for handling real-time notifications
 * 
 * Listens to socket events and displays toast notifications
 * 
 * Usage:
 * useNotifications();
 */
const useNotifications = () => {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Document notifications
    socket.on('document-updated', (data) => {
      toast(`${data.user.name} updated the document`, {
        icon: '📝',
      });
    });

    // Board notifications
    socket.on('card-created', (data) => {
      toast(`${data.user.name} created a new card`, {
        icon: '📋',
      });
    });

    socket.on('card-moved', (data) => {
      toast(`${data.user.name} moved a card`, {
        icon: '🔄',
      });
    });

    // Comment notifications
    socket.on('comment-added', (data) => {
      toast(`${data.user.name} commented: "${data.comment}"`, {
        icon: '💬',
      });
    });

    // Mention notifications
    socket.on('user-mentioned', (data) => {
      toast(`${data.user.name} mentioned you`, {
        icon: '@',
        duration: 5000,
      });
    });

    // Assignment notifications
    socket.on('task-assigned', (data) => {
      toast(`You were assigned to: ${data.task.title}`, {
        icon: '✅',
        duration: 5000,
      });
    });

    // Error notifications
    socket.on('error', (error) => {
      toast.error(error.message || 'An error occurred');
    });

    // Cleanup
    return () => {
      socket.off('document-updated');
      socket.off('card-created');
      socket.off('card-moved');
      socket.off('comment-added');
      socket.off('user-mentioned');
      socket.off('task-assigned');
      socket.off('error');
    };
  }, [socket, isConnected]);
};

export default useNotifications;
