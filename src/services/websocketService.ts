import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  private client: Client | null = null;
  private connected: boolean = false;

  connect(onConnect: () => void, onError?: (error: any) => void) {
    if (this.connected) {
      console.log('WebSocket already connected');
      onConnect();
      return;
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS(`${import.meta.env.VITE_API_URL}/ws`),

      onConnect: (frame) => {
        console.log('WebSocket Connected:', frame);
        this.connected = true;
        onConnect();
      },
      
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        this.connected = false;
        if (onError) onError(frame);
      },
      
      onWebSocketClose: () => {
        console.log('WebSocket connection closed');
        this.connected = false;
      },
      
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.connected = false;
      console.log('WebSocket disconnected');
    }
  }

  subscribeToAuction(auctionId: number, callback: (message: any) => void) {
    if (!this.client) {
      console.error('WebSocket client not initialized');
      return null;
    }

    return this.client.subscribe(
      `/topic/auction/${auctionId}`,
      (message) => {
        try {
          const data = JSON.parse(message.body);
          callback(data);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      }
    );
  }

  subscribeToAuctionStatus(auctionId: number, callback: (message: any) => void) {
    if (!this.client) {
      console.error('WebSocket client not initialized');
      return null;
    }

    return this.client.subscribe(
      `/topic/auction/${auctionId}/status`,
      (message) => {
        try {
          const data = JSON.parse(message.body);
          callback(data);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      }
    );
  }

  isConnected() {
    return this.connected;
  }
}

export default new WebSocketService();