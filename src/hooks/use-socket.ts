// filepath: hooks/useSocket.ts
import { getCookie } from '@/lib/cookie';
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const useSocket = (url: string) => {
  const [socket, setSocket] = useState<SocketIOClient.Socket | null>(null);

  useEffect(() => {
    const token = getCookie('token');
    const socketIo = io(url, {
      query: { token },
    });

    setSocket(socketIo);
    socketIo.on('disconnect', () => {
      console.log('Socket disconnected, attempting to reconnect...');
      socketIo.connect();
    });

    function cleanup() {
      socketIo.disconnect();
    }

    return cleanup;
  }, [url]);

  return socket;
};

export default useSocket;
