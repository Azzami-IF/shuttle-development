import { Injectable } from '@angular/core';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EchoService {
  private echoInstance: Echo<any> | null = null;
  private currentToken: string | null = null;

  constructor() {}

  /**
   * Get the Laravel Echo instance dynamically.
   * If the token changes, it disconnects and recreates Echo with the new token.
   */
  getEcho(): Echo<any> {
    const token = localStorage.getItem('token');

    // If the token changed, recreate the instance to update auth headers
    if (this.echoInstance && this.currentToken !== token) {
      this.disconnect();
    }

    if (!this.echoInstance) {
      this.currentToken = token;
      this.initEcho(token);
    }
    
    return this.echoInstance!;
  }

  private initEcho(token: string | null) {
    (window as any).Pusher = Pusher;

    this.echoInstance = new Echo({
      broadcaster: 'pusher',
      key: environment.pusherKey, 
      cluster: environment.pusherCluster,
      forceTLS: true,
      authEndpoint: `${environment.apiUrl}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      }
    });
  }

  /**
   * Disconnect and clear the current Echo instance.
   */
  disconnect() {
    if (this.echoInstance) {
      this.echoInstance.disconnect();
      this.echoInstance = null;
      this.currentToken = null;
    }
  }
}
