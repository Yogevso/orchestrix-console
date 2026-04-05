/**
 * Orchestrix Engine WebSocket client.
 *
 * Connects to Engine WS /ws endpoint with topic subscriptions.
 * Provides a React hook for real-time Engine updates.
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import type { EngineWsMessage } from '@/types/engine';

type Topic = 'job.update' | 'workflow.update' | 'worker.update';
type MessageHandler = (message: EngineWsMessage) => void;

function buildWsUrl(topics?: Topic[]): string {
  // Proxy through /api means we need the actual engine host.
  // In dev, Vite proxies /api to localhost:8000, but WS needs direct connection.
  const base = import.meta.env.VITE_ENGINE_WS_URL || 'ws://localhost:8000/ws';
  if (!topics || topics.length === 0) return base;
  return `${base}?topics=${topics.join(',')}`;
}

export function useEngineWs(topics?: Topic[]) {
  const [messages, setMessages] = useState<EngineWsMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef<Set<MessageHandler>>(new Set());
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const url = buildWsUrl(topics);
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);

    ws.onmessage = (event) => {
      try {
        const msg: EngineWsMessage = JSON.parse(event.data);
        setMessages((prev) => [msg, ...prev].slice(0, 200));
        handlersRef.current.forEach((fn) => fn(msg));
      } catch {
        // ignore non-JSON messages (pings, etc.)
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      // Auto-reconnect after 3 seconds
      reconnectTimer.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => ws.close();
  }, [topics]);

  const disconnect = useCallback(() => {
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    wsRef.current?.close();
    wsRef.current = null;
    setIsConnected(false);
  }, []);

  const subscribe = useCallback((handler: MessageHandler) => {
    handlersRef.current.add(handler);
    return () => { handlersRef.current.delete(handler); };
  }, []);

  const clearMessages = useCallback(() => setMessages([]), []);

  useEffect(() => {
    connect();
    return disconnect;
  }, [connect, disconnect]);

  return { messages, isConnected, subscribe, clearMessages, disconnect };
}
