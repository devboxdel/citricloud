// Lightweight WebSocket helper for realtime blog comments
// Backend expectation: a per-post channel that broadcasts JSON events
// Configure the URL pattern below to match your server.

export type CommentEvent =
  | { type: 'comment_created'; postId: number | string; comment: any }
  | { type: 'comment_deleted'; postId: number | string; commentId: number }
  | { type: 'comment_liked'; postId: number | string; commentId: number; userId?: string | number }
  | { type: 'comment_disliked'; postId: number | string; commentId: number; userId?: string | number };

import { COMMENTS_WS_BASE } from './config';
import { useAuthStore } from '../store/authStore';

export type SocketHandle = {
  close: () => void;
};

export function connectCommentsSocket(
  postId: number | string,
  onEvent: (evt: CommentEvent) => void,
  onStatus?: (status: 'connecting' | 'open' | 'closed' | 'error') => void
): SocketHandle {
  let ws: WebSocket | null = null;
  let closed = false;
  let retryMs = 2000;

  // Append auth token when available (query param typical for WS)
  const token = useAuthStore.getState().accessToken;
  // Include both token and access_token to maximize compatibility
  const qs = token
    ? `?access_token=${encodeURIComponent(token)}&token=${encodeURIComponent(token)}`
    : '';
  const url = `${COMMENTS_WS_BASE}/${postId}/comments${qs}`;

  const start = () => {
    if (onStatus) onStatus('connecting');
    ws = new WebSocket(url);

    ws.onopen = () => {
      retryMs = 2000;
      if (onStatus) onStatus('open');
    };
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        // Accept either an envelope {type, ...} or raw arrays
        if (Array.isArray(data)) {
          // If array of comments arrives, emit as created events in sequence
          data.forEach((comment: any) => {
            onEvent({ type: 'comment_created', postId, comment });
          });
        } else if (data && data.type) {
          onEvent(data as CommentEvent);
        }
      } catch (err) {
        // Ignore malformed messages
      }
    };
    ws.onerror = () => {
      if (onStatus) onStatus('error');
    };
    ws.onclose = () => {
      if (onStatus) onStatus('closed');
      if (closed) return;
      // Exponential-ish backoff up to ~30s
      retryMs = Math.min(retryMs * 2, 30000);
      setTimeout(start, retryMs);
    };
  };

  start();

  return {
    close: () => {
      closed = true;
      try {
        ws?.close();
      } catch {}
      ws = null;
    },
  };
}
