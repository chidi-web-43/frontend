import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';
let socket = null;

export const initializeSocket = (token, electionYear) => {
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('🔌 Socket connected');
    socket.emit('join-election', electionYear);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Socket disconnected');
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default { initializeSocket, getSocket, disconnectSocket };