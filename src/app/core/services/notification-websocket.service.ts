import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface WebSocketNotification {
  id: number;
  message: string;
  isRead: boolean;
  documentId: number | null;
  documentTitle: string | null;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationWebSocketService {
  private stompClient: Client | null = null;
  private connected$ = new BehaviorSubject<boolean>(false);
  private notifications$ = new BehaviorSubject<WebSocketNotification | null>(null);
  private unreadCount$ = new BehaviorSubject<number>(0);

  constructor() {}

  /**
   * Connect to WebSocket with JWT token
   */
  connect(userId: number, token: string): void {
    console.log('🔌 WebSocketService.connect() called for user:', userId);
    
    if (this.stompClient && this.stompClient.connected) {
      console.log('⚠️ WebSocket already connected, skipping...');
      return;
    }

    console.log('🔌 Creating new WebSocket connection...');
    // Add JWT token to URL as query parameter to pass authentication
    const wsUrl = `${environment.apiUrl}/ws?token=${encodeURIComponent(token)}`;
    console.log('🔌 WebSocket URL (token in query):', wsUrl);
    
    // Create SockJS instance with token in URL
    const socket = new SockJS(wsUrl);

    // Create STOMP client
    this.stompClient = new Client({
      webSocketFactory: () => socket as any,
      
      // Connection headers (JWT token)
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },

      // Debug logging (disable in production)
      debug: (str) => {
        if (!environment.production) {
          console.log('STOMP:', str);
        }
      },

      // Reconnect settings
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      // On successful connection
      onConnect: (frame) => {
        console.log('✅ WebSocket Connected Successfully!', frame);
        console.log('✅ Emitting connected=true to subscribers...');
        this.connected$.next(true);
        console.log('✅ Current connected$ value:', this.connected$.value);
        console.log('✅ Subscribing to notification topics...');
        this.subscribeToNotifications(userId);
      },

      // On connection error
      onStompError: (frame) => {
        console.error('❌ WebSocket Error:', frame);
        this.connected$.next(false);
      },

      // On disconnection
      onDisconnect: () => {
        console.log('🔌 WebSocket Disconnected');
        this.connected$.next(false);
      }
    });

    console.log('🔌 Activating STOMP client...');
    // Activate connection
    this.stompClient.activate();
    console.log('🔌 STOMP client activation initiated');
  }

  /**
   * Subscribe to notification topics
   */
  private subscribeToNotifications(userId: number): void {
    if (!this.stompClient) return;

    console.log('🔌 Subscribing to WebSocket topics for user:', userId);

    // Subscribe to notifications
    this.stompClient.subscribe(
      `/topic/notifications/${userId}`,
      (message: IMessage) => {
        const notification: WebSocketNotification = JSON.parse(message.body);
        console.log('📩 New notification received:', notification);
        this.notifications$.next(notification);
      }
    );
    console.log('✅ Subscribed to /topic/notifications/' + userId);

    // Subscribe to unread count
    this.stompClient.subscribe(
      `/topic/notifications/${userId}/count`,
      (message: IMessage) => {
        const count: number = JSON.parse(message.body);
        console.log('📊 Unread count received from WebSocket:', count);
        console.log('📊 Emitting count to subscribers...');
        this.unreadCount$.next(count);
        console.log('✅ Count emitted successfully');
      }
    );
    console.log('✅ Subscribed to /topic/notifications/' + userId + '/count');
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
      this.connected$.next(false);
    }
  }

  /**
   * Observable for connection status
   */
  isConnected(): Observable<boolean> {
    return this.connected$.asObservable();
  }

  /**
   * Observable for new notifications
   */
  getNotifications(): Observable<WebSocketNotification | null> {
    return this.notifications$.asObservable();
  }

  /**
   * Observable for unread count
   */
  getUnreadCount(): Observable<number> {
    return this.unreadCount$.asObservable();
  }

  /**
   * Check if currently connected
   */
  get connected(): boolean {
    return this.connected$.value;
  }
}
