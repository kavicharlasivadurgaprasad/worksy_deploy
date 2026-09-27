'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Search,
  Phone,
  Send,
  CheckCheck,
  ChevronLeft,
  AlertCircle,
  Loader2,
  RotateCcw,
  WifiOff,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useChatCenter, ChatPeer } from '@/lib/chat';

export interface MessagesTabOpenRequest extends ChatPeer {
  jobId?: string;
}

interface MessagesTabProps {
  /** Set by the parent (e.g. after clicking "Message" on a customer or job) to jump straight into that conversation. */
  openRequest?: MessagesTabOpenRequest | null;
  /** Called once the open request above has been applied, so the parent can clear it and avoid re-triggering. */
  onOpenRequestHandled?: () => void;
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

function Avatar({ name, url, size = 'md' }: { name: string; url: string | null; size?: 'sm' | 'lg' }) {
  const dims = size === 'lg' ? 'w-13 h-13 sm:w-14 sm:h-14 text-base' : 'w-10 h-10 text-sm';
  if (url) {
    return <img src={url} alt={name} className={`${dims} rounded-2xl object-cover border border-stone-200`} />;
  }
  return (
    <div className={`${dims} rounded-2xl bg-amber-900 text-white flex items-center justify-center font-semibold border border-stone-200 shrink-0`}>
      {initials(name)}
    </div>
  );
}

const quickReplies = [
  'On my way now! ETA is about 15 minutes.',
  'I have arrived at your gate / entrance.',
  'Please share the 4-digit start OTP with me.',
  'Service is completed, generated the digital invoice.',
];

export default function MessagesTab({ openRequest, onOpenRequestHandled }: MessagesTabProps) {
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

  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeJobId, setActiveJobId] = useState<string | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openRequest) return;
    openConversation(openRequest);
    setActiveJobId(openRequest.jobId);
    onOpenRequestHandled?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openRequest]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, activePeer?.otherUserId]);

  const handleSelectConversation = (peer: ChatPeer) => {
    setActiveJobId(undefined);
    openConversation(peer);
  };

  const handleSend = (textToSend?: string) => {
    const text = (textToSend ?? inputText).trim();
    if (!text) return;
    setInputText('');
    sendMessage(text);
  };

  const filteredConversations = conversations.filter((t) =>
    t.otherUserName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm h-[820px] max-h-[88vh] flex flex-col md:flex-row w-full max-w-[1840px] 2xl:max-w-[1920px] mx-auto mb-20 lg:mb-10">
      {/* LEFT PANEL: CONVERSATIONS LIST */}
      <div className={`w-full md:w-96 lg:w-[420px] border-r border-stone-200 flex flex-col shrink-0 bg-stone-50/50 ${activePeer ? 'hidden md:flex' : ''}`}>
        <div className="p-5 border-b border-stone-200 bg-white">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-xl sm:text-2xl font-medium tracking-tight text-stone-900">
              Direct <span className="italic font-normal">Messages</span>
            </h2>
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200/80">
              Provider Ops
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 flex items-center gap-1.5">
            Communicate directly with your assigned customers
            {status !== 'open' && (
              <span title="Reconnecting..." className="text-amber-500 inline-flex">
                <WifiOff size={13} />
              </span>
            )}
          </p>
        </div>

        {/* Search Input */}
        <div className="p-3 border-b border-stone-200 bg-white">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-10 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-black"
            />
          </div>
        </div>

        {/* Conversations List */}
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
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-2 text-stone-400">
              <MessageCircle size={28} />
              <p className="text-sm">{conversations.length === 0 ? 'No conversations yet.' : 'No matches.'}</p>
              {conversations.length === 0 && (
                <p className="text-xs">Message a customer from a job to start chatting.</p>
              )}
            </div>
          ) : (
            filteredConversations.map((thread) => {
              const isSelected = thread.otherUserId === activePeer?.otherUserId;
              return (
                <button
                  key={thread.otherUserId}
                  onClick={() => handleSelectConversation(thread)}
                  className={`w-full p-4 sm:p-5 flex items-start gap-3.5 text-left transition-colors cursor-pointer ${
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

                    <div className="text-xs font-medium text-amber-800 truncate mt-0.5">Customer</div>

                    <p className="text-xs sm:text-sm text-stone-600 truncate mt-1 leading-relaxed">
                      {thread.lastMessageMine && thread.lastMessage ? 'You: ' : ''}
                      {thread.lastMessage || 'Say hello to start the conversation'}
                    </p>
                  </div>

                  {thread.unreadCount > 0 && <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 self-center" />}
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
                aria-label="Back to conversations"
              >
                <ChevronLeft size={20} />
              </button>

              <Avatar name={activePeer.otherUserName} url={activePeer.otherUserAvatarUrl} />

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-medium text-stone-900 text-base tracking-tight truncate">
                    {activePeer.otherUserName}
                  </h3>
                  {activeJobId && (
                    <span className="text-[11px] font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded font-semibold">
                      #{activeJobId}
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500 truncate mt-0.5">Customer</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={activePeer.otherUserPhone ? `tel:${activePeer.otherUserPhone}` : undefined}
                aria-disabled={!activePeer.otherUserPhone}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                  activePeer.otherUserPhone ? 'bg-stone-100 hover:bg-stone-200 text-stone-800' : 'bg-stone-50 text-stone-300 pointer-events-none'
                }`}
              >
                <Phone size={14} />
                <span className="hidden sm:inline">Call Customer</span>
              </a>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-stone-50/40">
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
                      className={`max-w-md sm:max-w-lg p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                        isMine
                          ? `bg-black text-white rounded-br-xs ${msg.pending ? 'opacity-60' : ''} ${msg.failed ? 'bg-red-600' : ''}`
                          : 'bg-white border border-stone-200 text-stone-900 rounded-bl-xs'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-stone-400 mt-1 px-1">
                      {msg.failed ? (
                        <button onClick={() => retryMessage(msg.id)} className="flex items-center gap-1 text-red-500 font-semibold">
                          <RotateCcw size={11} /> Failed — retry
                        </button>
                      ) : (
                        <>
                          <span>{msg.pending ? 'Sending…' : formatTimestamp(msg.createdAt)}</span>
                          {isMine && !msg.pending && <CheckCheck size={12} className="text-emerald-500" />}
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies Chips */}
          <div className="px-4 py-2 bg-stone-50 border-t border-stone-200 overflow-x-auto no-scrollbar flex items-center gap-2 shrink-0">
            <span className="text-[10px] uppercase font-bold text-stone-400 shrink-0">Quick:</span>
            {quickReplies.map((reply, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(reply)}
                className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-stone-700 text-xs hover:border-black whitespace-nowrap transition-colors cursor-pointer shrink-0 shadow-2xs"
              >
                {reply}
              </button>
            ))}
          </div>

          {/* Message Input Box */}
          <div className="p-3 sm:p-4 bg-white border-t border-stone-200 flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              placeholder={`Message ${activePeer.otherUserName}...`}
              className="flex-1 py-2.5 px-3.5 rounded-xl bg-stone-100 border border-transparent focus:border-stone-400 focus:bg-white text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none transition-all"
            />

            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!inputText.trim()}
              className="p-2.5 rounded-xl bg-black text-white hover:bg-stone-800 disabled:opacity-40 disabled:pointer-events-none transition-all shrink-0 cursor-pointer"
              title="Send Message"
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
