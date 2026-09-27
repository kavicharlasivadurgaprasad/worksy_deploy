'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Send,
  Phone,
  CheckCheck,
  ShieldCheck,
  ChevronLeft,
  CalendarCheck,
  AlertCircle,
  Loader2,
  RotateCcw,
  WifiOff,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useChatCenter, ChatPeer } from '@/lib/chat';

export interface MessagesTabOpenRequest extends ChatPeer {
  bookingId?: string;
}

interface MessagesTabProps {
  /** Set by the parent (e.g. after clicking "Message" on a provider or booking) to jump straight into that conversation. */
  openRequest?: MessagesTabOpenRequest | null;
  /** Called once the open request above has been applied, so the parent can clear it and avoid re-triggering. */
  onOpenRequestHandled?: () => void;
  onViewBookingById?: (bookingId: string) => void;
}

function formatTimestamp(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const sameDay = d.toDateString() === new Date().toDateString();
  return sameDay ? time : `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${time}`;
}

function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('') || '?';
}

function Avatar({ name, url, size = 'md' }: { name: string; url: string | null; size?: 'sm' | 'md' | 'lg' }) {
  const dims = size === 'lg' ? 'w-13 h-13 sm:w-14 sm:h-14 text-base' : size === 'sm' ? 'w-10 h-10 text-xs' : 'w-10 h-10 text-sm';
  if (url) {
    return <img src={url} alt={name} className={`${dims} rounded-2xl object-cover border border-stone-200`} />;
  }
  return (
    <div className={`${dims} rounded-2xl bg-stone-900 text-white flex items-center justify-center font-semibold border border-stone-200 shrink-0`}>
      {initials(name)}
    </div>
  );
}

const quickReplies = [
  'I am at home, please come in.',
  'Please ring the doorbell twice.',
  'What is your updated ETA?',
  'Please call when you reach the gate.',
];

export default function MessagesTab({ openRequest, onOpenRequestHandled, onViewBookingById }: MessagesTabProps) {
  const { user } = useAuth();
  const {
    status,
    conversations,
    conversationsLoading,
    conversationsError,
    activePeer,
    openConversation,
    closeConversation,
    messages,
    messagesLoading,
    messagesError,
    sendMessage,
    retryMessage,
  } = useChatCenter(user?.id);

  const [messageInput, setMessageInput] = useState('');
  const [activeBookingId, setActiveBookingId] = useState<string | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Apply a "please open this conversation" request coming from elsewhere in the app
  // (a provider profile, a booking, a live-tracking screen, ...).
  useEffect(() => {
    if (!openRequest) return;
    openConversation(openRequest);
    setActiveBookingId(openRequest.bookingId);
    onOpenRequestHandled?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openRequest]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, activePeer?.otherUserId]);

  const handleSelectConversation = (peer: ChatPeer) => {
    setActiveBookingId(undefined);
    openConversation(peer);
  };

  const handleSend = (text?: string) => {
    const content = (text ?? messageInput).trim();
    if (!content) return;
    setMessageInput('');
    sendMessage(content);
  };

  return (
    <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm h-[820px] max-h-[88vh] flex flex-col md:flex-row w-full max-w-[1760px] 2xl:max-w-[1840px] mx-auto mb-20 lg:mb-10">
      {/* LEFT PANEL: CONVERSATIONS LIST */}
      <div
        className={`w-full md:w-96 lg:w-[420px] border-r border-stone-200 flex flex-col shrink-0 bg-stone-50/50 ${
          activePeer ? 'hidden md:flex' : ''
        }`}
      >
        <div className="p-5 border-b border-stone-200 bg-white">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-xl sm:text-2xl font-medium tracking-tight text-stone-900">
              Direct <span className="italic font-normal">Messages</span>
            </h2>
            {status !== 'open' && (
              <span title="Reconnecting..." className="text-amber-500">
                <WifiOff size={16} />
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">Communicate directly with your assigned technicians</p>
        </div>

        <div className="overflow-y-auto flex-1 divide-y divide-stone-100">
          {conversationsLoading ? (
            <div className="flex items-center justify-center py-16 text-stone-400 gap-2 text-sm">
              <Loader2 size={16} className="animate-spin" /> Loading conversations…
            </div>
          ) : conversationsError ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-2 text-stone-500">
              <AlertCircle size={20} className="text-red-400" />
              <p className="text-sm">{conversationsError}</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-2 text-stone-400">
              <MessageCircle size={28} />
              <p className="text-sm">No conversations yet.</p>
              <p className="text-xs">Message a provider from their profile or a booking to start chatting.</p>
            </div>
          ) : (
            conversations.map((thread) => {
              const isSelected = thread.otherUserId === activePeer?.otherUserId;
              return (
                <button
                  key={thread.otherUserId}
                  onClick={() => handleSelectConversation(thread)}
                  className={`w-full p-4 sm:p-5 flex items-start gap-3.5 text-left transition-colors ${
                    isSelected ? 'bg-amber-50/60 border-l-4 border-l-black' : 'hover:bg-white'
                  }`}
                >
                  <Avatar name={thread.otherUserName} url={thread.otherUserAvatarUrl} size="lg" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="font-display font-medium text-stone-900 text-base tracking-tight truncate">
                        {thread.otherUserName}
                      </h3>
                      <span className="text-[11px] text-stone-400 shrink-0">{formatTimestamp(thread.lastMessageAt)}</span>
                    </div>

                    <div className="text-xs font-medium text-stone-500 truncate mt-0.5">
                      {thread.otherUserRole === 'PROVIDER' ? 'Service Provider' : 'Customer'}
                    </div>

                    <p className="text-xs sm:text-sm text-stone-600 truncate mt-1 leading-relaxed">
                      {thread.lastMessageMine && thread.lastMessage ? 'You: ' : ''}
                      {thread.lastMessage || 'Say hello to start the conversation'}
                    </p>
                  </div>

                  {thread.unreadCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0 self-center">
                      {thread.unreadCount}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PANEL: CHAT WINDOW */}
      {activePeer ? (
        <div className="flex-1 flex flex-col h-full bg-white min-w-0">
          {/* Chat Header */}
          <div className="p-4 border-b border-stone-200 flex items-center justify-between gap-3 bg-white/95 backdrop-blur-md">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={closeConversation}
                className="md:hidden p-1.5 rounded-lg hover:bg-stone-100 text-stone-600"
              >
                <ChevronLeft size={20} />
              </button>

              <Avatar name={activePeer.otherUserName} url={activePeer.otherUserAvatarUrl} size="sm" />

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-medium text-stone-900 text-base tracking-tight truncate">
                    {activePeer.otherUserName}
                  </h3>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold hidden sm:inline">
                    Verified
                  </span>
                </div>
                <div className="text-xs text-stone-500 truncate">
                  {activePeer.otherUserRole === 'PROVIDER' ? 'Service Provider' : 'Customer'}
                  {activeBookingId && ` • #${activeBookingId}`}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {activeBookingId && onViewBookingById && (
                <button
                  onClick={() => onViewBookingById(activeBookingId)}
                  className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                >
                  <CalendarCheck size={13} />
                  <span>Booking</span>
                </button>
              )}

              <a
                href={activePeer.otherUserPhone ? `tel:${activePeer.otherUserPhone}` : undefined}
                aria-disabled={!activePeer.otherUserPhone}
                className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-white text-xs font-bold transition-colors shadow-sm ${
                  activePeer.otherUserPhone ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-stone-300 pointer-events-none'
                }`}
              >
                <Phone size={13} />
                <span>Call</span>
              </a>
            </div>
          </div>

          {/* Messages Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-stone-50/40">
            <div className="flex items-center justify-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-[11px] text-stone-500">
                <ShieldCheck size={13} className="text-emerald-600" />
                <span>Only you and {activePeer.otherUserName.split(' ')[0]} can see this conversation</span>
              </div>
            </div>

            {messagesLoading ? (
              <div className="flex items-center justify-center py-10 text-stone-400 gap-2 text-sm">
                <Loader2 size={16} className="animate-spin" /> Loading messages…
              </div>
            ) : messagesError ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
                <AlertCircle size={20} className="text-red-400" />
                <p className="text-sm text-stone-500">{messagesError}</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 gap-2 text-center text-stone-400">
                <MessageCircle size={26} />
                <p className="text-sm">No messages yet. Say hello to {activePeer.otherUserName.split(' ')[0]}!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMine = msg.senderId === user?.id;
                return (
                  <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`max-w-xs sm:max-w-md px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                        isMine
                          ? `bg-black text-white rounded-tr-none ${msg.pending ? 'opacity-60' : ''} ${msg.failed ? 'bg-red-600' : ''}`
                          : 'bg-white text-stone-900 border border-stone-200 rounded-tl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-stone-400 px-1">
                      {msg.failed ? (
                        <button onClick={() => retryMessage(msg.id)} className="flex items-center gap-1 text-red-500 font-semibold">
                          <RotateCcw size={11} /> Failed — retry
                        </button>
                      ) : (
                        <>
                          <span>{msg.pending ? 'Sending…' : formatTimestamp(msg.createdAt)}</span>
                          {isMine && !msg.pending && <CheckCheck size={12} className={msg.read ? 'text-sky-500' : 'text-stone-400'} />}
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Replies */}
          <div className="px-4 py-2 bg-stone-50 border-t border-stone-200 overflow-x-auto no-scrollbar flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-stone-400 shrink-0">Quick:</span>
            {quickReplies.map((reply, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(reply)}
                className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-stone-700 text-xs hover:border-black whitespace-nowrap transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-3 sm:p-4 bg-white border-t border-stone-200 flex items-center gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              placeholder={`Message ${activePeer.otherUserName}...`}
              className="flex-1 py-2.5 px-3.5 rounded-xl bg-stone-100 border border-transparent focus:border-stone-400 focus:bg-white text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none"
            />

            <button
              onClick={() => handleSend()}
              disabled={!messageInput.trim()}
              className="p-2.5 rounded-xl bg-black text-white hover:bg-stone-800 disabled:opacity-40 disabled:pointer-events-none transition-all shrink-0"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-8 text-center text-stone-400">
          Select a conversation from the left to start messaging.
        </div>
      )}
    </div>
  );
}
