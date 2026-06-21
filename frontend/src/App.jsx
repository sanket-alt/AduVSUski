import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import FireBackground from './components/FireBackground';
import HealthBar from './components/HealthBar';

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export default function App() {
  const [stats, setStats] = useState({ player1: { followers: 0 }, player2: { followers: 0 } });
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    
    socket.on('statsUpdate', (data) => {
      setStats(data);
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div className="relative w-screen h-screen flex flex-col items-center pt-24 font-pixel text-white">
      <FireBackground />

      {/* Status Indicator */}
      <div className={`absolute top-4 left-4 text-xs ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
        {isConnected ? 'LIVE LINK ACTIVE' : 'CONNECTION LOST'}
      </div>

      {/* Header Info */}
      <div className="w-11/12 max-w-6xl flex justify-between items-end mb-8 z-10 px-4">
        <div className="flex flex-col text-left">
          <span className="text-blue-400 text-3xl mb-2">PLAYER 1</span>
          <span className="text-5xl">{stats.player1.followers.toLocaleString()}</span>
        </div>
        
        <div className="text-yellow-500 text-6xl animate-pulse pb-2">VS</div>
        
        <div className="flex flex-col text-right">
          <span className="text-red-400 text-3xl mb-2">PLAYER 2</span>
          <span className="text-5xl">{stats.player2.followers.toLocaleString()}</span>
        </div>
      </div>

      {/* The Tug-of-War Component */}
      <HealthBar p1Count={stats.player1.followers} p2Count={stats.player2.followers} />
      
      {/* Footer / Metric Label */}
      <div className="mt-8 text-gray-400 text-xl tracking-widest z-10">
        FOLLOWER DOMINANCE
      </div>
    </div>
  );
}
