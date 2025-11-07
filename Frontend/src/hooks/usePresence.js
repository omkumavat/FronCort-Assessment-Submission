import { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';

/**
 * usePresence - Hook for tracking user presence
 * 
 * @param {string} roomId - Room/document/board ID
 * @param {object} userData - Current user data
 * 
 * Returns:
 * - activeUsers: List of active users in the room
 * 
 * Usage:
 * const { activeUsers } = usePresence(documentId, currentUser);
 */
const usePresence = (roomId, userData) => {
  const { socket, isConnected } = useSocket();
  const [activeUsers, setActiveUsers] = useState([]);

  useEffect(() => {
    if (!socket || !isConnected || !roomId) return;

    // Join room
    socket.emit('join-room', { roomId, user: userData });

    // Listen for presence updates
    socket.on('presence-update', (users) => {
      setActiveUsers(users);
    });

    socket.on('user-joined', (user) => {
      setActiveUsers(prev => [...prev.filter(u => u.id !== user.id), user]);
    });

    socket.on('user-left', (userId) => {
      setActiveUsers(prev => prev.filter(u => u.id !== userId));
    });

    // Send heartbeat every 30 seconds
    const heartbeat = setInterval(() => {
      socket.emit('heartbeat', { roomId, user: userData });
    }, 30000);

    // Cleanup
    return () => {
      socket.emit('leave-room', { roomId, user: userData });
      socket.off('presence-update');
      socket.off('user-joined');
      socket.off('user-left');
      clearInterval(heartbeat);
    };
  }, [socket, isConnected, roomId, userData]);

  return { activeUsers };
};

export default usePresence;
