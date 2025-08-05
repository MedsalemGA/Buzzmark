import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

@Injectable({
  providedIn: 'root'
})
export class MessagingService {
  private apiUrl = 'http://localhost:8000/api'; // Adjust if port differs
  private typingSubject = new Subject<boolean>();
  private messageSubject = new Subject<any>();
  private echo: Echo<'pusher'>; // Fixed generic type
  private currentUserId: number | null = null;

  constructor(private http: HttpClient) {
    (window as any).Pusher = Pusher;
    this.echo = new Echo<'pusher'>({
      broadcaster: 'pusher',
      key: 'your-pusher-key', // Replace with PUSHER_APP_KEY
      cluster: 'your-cluster', // Replace with PUSHER_APP_CLUSTER
      forceTLS: true,
      authEndpoint: 'http://localhost:8000/broadcasting/auth',
      auth: {
        headers: {
          Authorization: 'Bearer ' + this.getToken(),
          'X-Requested-With': 'XMLHttpRequest'
        }
      }
    });
    // Load user ID from localStorage
    const userId = localStorage.getItem('user_id');
    if (userId) {
      this.currentUserId = parseInt(userId, 10);
    }
  }

  setCurrentUserId(userId: number) {
    this.currentUserId = userId;
    localStorage.setItem('user_id', userId.toString());
  }

  private getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    });
  }

  sendMessage(conversationId: number, content: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/conversations/${conversationId}/messages`, { content }, { headers: this.getHeaders() });
  }

  deleteMessage(messageId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/conversations/1/messages/${messageId}`, { headers: this.getHeaders() });
  }

  forwardMessage(messageId: number, targetConversationId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/conversations/1/messages/${messageId}/forward`, { target_conversation_id: targetConversationId }, { headers: this.getHeaders() });
  }

  sendTypingStatus(conversationId: number, isTyping: boolean): Observable<any> {
    return this.http.post(`${this.apiUrl}/conversations/${conversationId}/typing`, { isTyping }, { headers: this.getHeaders() });
  }

  getTypingStatus(conversationId: number): Observable<boolean> {
    this.echo.channel(`conversation.${conversationId}`)
      .listen('.typing', (e: any) => {
        if (e.userId !== this.currentUserId) {
          this.typingSubject.next(e.isTyping);
        }
      });
    return this.typingSubject.asObservable();
  }

  listenForMessages(conversationId: number): Observable<any> {
    this.echo.channel(`conversation.${conversationId}`)
      .listen('.message.sent', (e: any) => {
        this.messageSubject.next({
          id: e.message.id,
          content: e.message.content,
          timestamp: e.message.sent_at,
          isSentByMe: e.message.sender_id === this.currentUserId,
          status: e.message.status
        });
      });
    return this.messageSubject.asObservable();
  }
}