'use client';

/**
 * Real-time chat client: talks to the Spring Boot backend's REST chat endpoints for history
 * (so a page refresh never loses messages) and to its raw WebSocket endpoint (/ws/chat) for
 * live delivery. See worsi-backend's ChatController / ChatWebSocketHandler for the server side.
 *
 * This file is intentionally framework-light (no extra npm dependency): it uses the browser's
 * native WebSocket API directly, since the backend speaks plain JSON frames rather than STOMP.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { api, ApiChatMessage, ApiConversation, ApiError, API_BASE_URL, tokenStore } from '@/lib/api';

export type ChatConnectionStatus = 'connecting' | 'open' | 'closed' | 'error';

/** A conversation-list row. Includes conversations that exist only locally (opened but no message sent yet). */
export interface ChatPeer {
  otherUserId: number;
  otherUserName: string;
  otherUserAvatarUrl: string | null;
  otherUserRole: 'CUSTOMER' | 'PROVIDER';
  otherUserPhone: string | null;
}

export interface ChatConversationRow extends ChatPeer {
  lastMessage: string;
  lastMessageAt: string | null;
  lastMessageMine: boolean;
  unreadCount: number;
}

/** A message as rendered in the UI; `pending` messages are optimistic sends not yet confirmed by the server. */
export interface ChatUiMessage extends ApiChatMessage {
  pending?: boolean;
  failed?: boolean;
}

function wsBaseUrl(): string {
  // API_BASE_URL looks like "http://localhost:8080/api/v1" -> the WS endpoint lives at the
  // application root, "ws://localhost:8080/ws/chat" (it is not under /api/v1).
  const httpRoot = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
  return httpRoot.replace(/^http/, 'ws');
}

interface IncomingFrame extends ApiChatMessage {
  type?: string;
  message?: string; // present on {"type":"ERROR", "message": "..."} frames
}

const RECONNECT_DELAYS_MS = [1000, 2000, 5000, 10000, 15000];

/**
 * One hook, shared by both the customer and provider Messages tabs, that owns:
 *  - the conversation list (who you've chatted with, last message, unread count)
 *  - the currently open conversation's message history
 *  - the live WebSocket connection, with automatic reconnect and a REST fallback for sending
 *
 * currentUserId should be the authenticated user's numeric id (undefined while auth is loading).
 */
export function useChatCenter(currentUserId: number | undefined) {
  const [conversations, setConversations] = useState<ChatConversationRow[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [conversationsError, setConversationsError] = useState('');

  const [activePeer, setActivePeer] = useState<ChatPeer | null>(null);
  const [messages, setMessages] = useState<ChatUiMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState('');

  const [status, setStatus] = useState<ChatConnectionStatus>('connecting');

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closedByUsRef = useRef(false);
  const activePeerIdRef = useRef<number | null>(null);
  useEffect(() => {
    activePeerIdRef.current = activePeer?.otherUserId ?? null;
  }, [activePeer]);

  const refreshConversations = useCallback(async () => {
    try {
      const list = await api.getConversations();
      setConversations(
        list.map((c: ApiConversation) => ({
          otherUserId: c.otherUserId,
          otherUserName: c.otherUserName,
          otherUserAvatarUrl: c.otherUserAvatarUrl,
          otherUserRole: c.otherUserRole,
          otherUserPhone: c.otherUserPhone,
          lastMessage: c.lastMessage,
          lastMessageAt: c.lastMessageAt,
          lastMessageMine: c.lastMessageMine,
          unreadCount: c.unreadCount,
        }))
      );
      setConversationsError('');
    } catch (e) {
      setConversationsError(e instanceof ApiError || e instanceof Error ? e.message : 'Could not load conversations.');
    } finally {
      setConversationsLoading(false);
    }
  }, []);

  // Initial + reconnect-triggered conversation list load
  useEffect(() => {
    if (!currentUserId) return;
    refreshConversations();
  }, [currentUserId, refreshConversations]);

  const loadMessages = useCallback(async (otherUserId: number) => {
    setMessagesLoading(true);
    setMessagesError('');
    try {
      const history = await api.getMessages(otherUserId);
      setMessages(history);
      // Best-effort: mark unread messages from this peer as read now that we're viewing them.
      api.markConversationRead(otherUserId).catch(() => {});
      setConversations((prev) => prev.map((c) => (c.otherUserId === otherUserId ? { ...c, unreadCount: 0 } : c)));
    } catch (e) {
      setMessagesError(e instanceof ApiError || e instanceof Error ? e.message : 'Could not load this conversation.');
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  /** Opens (or creates, if no messages exist yet) a conversation with this user and selects it. */
  const openConversation = useCallback(
    (peer: ChatPeer) => {
      setActivePeer(peer);
      setConversations((prev) =>
        prev.some((c) => c.otherUserId === peer.otherUserId)
          ? prev
          : [
              {
                ...peer,
                lastMessage: '',
                lastMessageAt: null,
                lastMessageMine: false,
                unreadCount: 0,
              },
              ...prev,
            ]
      );
      loadMessages(peer.otherUserId);
    },
    [loadMessages]
  );

  const closeConversation = useCallback(() => setActivePeer(null), []);

  // Merge an incoming/confirmed message into local state (conversation list + active thread).
  const applyIncomingMessage = useCallback(
    (msg: ApiChatMessage, myId: number) => {
      const peerId = msg.senderId === myId ? msg.receiverId : msg.senderId;
      const mine = msg.senderId === myId;

      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.otherUserId === peerId);
        const isViewingThisPeer = activePeerIdRef.current === peerId;
        if (idx === -1) {
          return [
            {
              otherUserId: peerId,
              otherUserName: mine ? msg.receiverName : msg.senderName,
              otherUserAvatarUrl: null,
              otherUserRole: 'CUSTOMER',
              otherUserPhone: null,
              lastMessage: msg.content,
              lastMessageAt: msg.createdAt,
              lastMessageMine: mine,
              unreadCount: mine || isViewingThisPeer ? 0 : 1,
            },
            ...prev,
          ];
        }
        const updated = {
          ...prev[idx],
          lastMessage: msg.content,
          lastMessageAt: msg.createdAt,
          lastMessageMine: mine,
          unreadCount: mine || isViewingThisPeer ? 0 : prev[idx].unreadCount + 1,
        };
        return [updated, ...prev.slice(0, idx), ...prev.slice(idx + 1)];
      });

      if (activePeerIdRef.current === peerId) {
        setMessages((prev) => {
          // Reconcile with an optimistic "pending" send of the same outgoing content, if present.
          if (mine) {
            const pendingIdx = prev.findIndex((m) => m.pending && m.content === msg.content);
            if (pendingIdx !== -1) {
              const copy = prev.slice();
              copy[pendingIdx] = msg;
              return copy;
            }
          }
          if (prev.some((m) => m.id === msg.id)) return prev; // de-dupe
          return [...prev, msg];
        });
        api.markConversationRead(peerId).catch(() => {});
      }
    },
    []
  );

  // --- WebSocket connection lifecycle -----------------------------------------------------
  const connect = useCallback(() => {
    if (!currentUserId) return;
    const token = tokenStore.get();
    if (!token) return;

    closedByUsRef.current = false;
    setStatus('connecting');

    let socket: WebSocket;
    try {
      socket = new WebSocket(`${wsBaseUrl()}/ws/chat?token=${encodeURIComponent(token)}`);
    } catch {
      setStatus('error');
      scheduleReconnect();
      return;
    }
    socketRef.current = socket;

    socket.onopen = () => {
      reconnectAttemptRef.current = 0;
      setStatus('open');
      // We may have missed messages while disconnected: resync from the server.
      refreshConversations();
      if (activePeerIdRef.current) loadMessages(activePeerIdRef.current);
    };

    socket.onmessage = (event) => {
      let frame: IncomingFrame;
      try {
        frame = JSON.parse(event.data);
      } catch {
        return;
      }
      if (frame.type === 'ERROR') {
        setMessagesError(frame.message || 'Could not send message.');
        setMessages((prev) => {
          const idx = [...prev].reverse().findIndex((m) => m.pending);
          if (idx === -1) return prev;
          const realIdx = prev.length - 1 - idx;
          const copy = prev.slice();
          copy[realIdx] = { ...copy[realIdx], pending: false, failed: true };
          return copy;
        });
        return;
      }
      applyIncomingMessage(frame, currentUserId);
    };

    socket.onerror = () => setStatus('error');

    socket.onclose = () => {
      setStatus('closed');
      socketRef.current = null;
      if (!closedByUsRef.current) scheduleReconnect();
    };
  }, [currentUserId, applyIncomingMessage, refreshConversations, loadMessages]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimerRef.current) return;
    const attempt = reconnectAttemptRef.current;
    const delay = RECONNECT_DELAYS_MS[Math.min(attempt, RECONNECT_DELAYS_MS.length - 1)];
    reconnectAttemptRef.current += 1;
    reconnectTimerRef.current = setTimeout(() => {
      reconnectTimerRef.current = null;
      connect();
    }, delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connect]);

  useEffect(() => {
    if (!currentUserId) return;
    connect();
    return () => {
      closedByUsRef.current = true;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      socketRef.current?.close();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  // --- Sending ------------------------------------------------------------------------------
  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !activePeer || !currentUserId) return;

      const optimistic: ChatUiMessage = {
        id: -Date.now(), // negative id marks it as a client-local placeholder
        senderId: currentUserId,
        senderName: 'You',
        receiverId: activePeer.otherUserId,
        receiverName: activePeer.otherUserName,
        content: trimmed,
        createdAt: new Date().toISOString(),
        read: false,
        pending: true,
      };
      setMessages((prev) => [...prev, optimistic]);

      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ receiverId: activePeer.otherUserId, content: trimmed }));
        return;
      }

      // WebSocket unavailable: fall back to a plain REST call so the message still goes through.
      try {
        const saved = await api.sendChatMessage(activePeer.otherUserId, trimmed);
        setMessages((prev) => {
          const idx = prev.findIndex((m) => m.id === optimistic.id);
          if (idx === -1) return prev;
          const copy = prev.slice();
          copy[idx] = saved;
          return copy;
        });
        setConversations((prev) => {
          const idx = prev.findIndex((c) => c.otherUserId === activePeer.otherUserId);
          if (idx === -1) return prev;
          const updated = { ...prev[idx], lastMessage: trimmed, lastMessageAt: saved.createdAt, lastMessageMine: true };
          return [updated, ...prev.slice(0, idx), ...prev.slice(idx + 1)];
        });
      } catch {
        setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? { ...m, pending: false, failed: true } : m)));
      }
    },
    [activePeer, currentUserId]
  );

  const retryMessage = useCallback(
    (failedId: number) => {
      const msg = messages.find((m) => m.id === failedId);
      if (!msg) return;
      setMessages((prev) => prev.filter((m) => m.id !== failedId));
      sendMessage(msg.content);
    },
    [messages, sendMessage]
  );

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return {
    status,
    conversations,
    conversationsLoading,
    conversationsError,
    totalUnread,
    activePeer,
    openConversation,
    closeConversation,
    messages,
    messagesLoading,
    messagesError,
    sendMessage,
    retryMessage,
  };
}
