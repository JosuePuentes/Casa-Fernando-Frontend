import { useEffect, useRef, useState } from 'react';

const WS_BASE = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/api';

export function useWebSocketMesonera(token, onMessage) {
  const wsRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const reconnectRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    const connect = () => {
      const url = `${WS_BASE}/ws/mesonera`;
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => setConnected(true);
      ws.onclose = () => {
        setConnected(false);
        reconnectRef.current = setTimeout(connect, 3000);
      };
      ws.onerror = () => ws.close();
      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === 'notificacion_cliente' && data.vibrar) {
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
          }
          onMessage?.(data);
        } catch (_) {}
      };
    };

    connect();
    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [token, onMessage]);

  const sendPing = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send('ping');
    }
  };

  useEffect(() => {
    if (!connected) return;
    const id = setInterval(sendPing, 30000);
    return () => clearInterval(id);
  }, [connected]);

  return { connected };
}
