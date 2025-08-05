import { Component, ViewChild, ElementRef, AfterViewChecked, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessagingService } from '../services/messaging.service';
import { Subscription } from 'rxjs';

interface Message {
  id?: number;
  content: string;
  timestamp: Date;
  isSentByMe: boolean;
  status?: 'sent' | 'delivered' | 'read'; // Statut du message
}

interface Conversation {
  id: number;
  name: string;
  lastMessage: string;
  lastMessageTimestamp?: Date;
  messages: Message[];
  imageUrl?: string;
  type: 'admin' | 'company' | 'influencer';
  isOnline?: boolean; // Statut en ligne
}

@Component({
  selector: 'app-messaging',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messaging.component.html',
  styleUrls: ['./messaging.component.css']
})
export class MessagingComponent implements AfterViewChecked {
  @ViewChild('messageContainer') messageContainer!: ElementRef;

  conversations: Conversation[] = [
    {
      id: 1,
      name: 'Entreprise A',
      lastMessage: 'Bonjour, nous souhaitons collaborer...',
      lastMessageTimestamp: new Date(),
      type: 'company',
      imageUrl: 'https://via.placeholder.com/40?text=Logo',
      isOnline: true,
      messages: [
        { content: 'Bonjour, nous souhaitons collaborer sur un projet.', timestamp: new Date(), isSentByMe: false },
        { content: 'Super, parlons des détails !', timestamp: new Date(), isSentByMe: true, status: 'read' }
      ]
    },
    {
      id: 2,
      name: 'Admin',
      lastMessage: 'Mise à jour des règles...',
      lastMessageTimestamp: new Date(),
      type: 'admin',
      imageUrl: 'https://via.placeholder.com/40?text=Admin',
      isOnline: false,
      messages: []
    },
    {
      id: 3,
      name: 'Influenceur B',
      lastMessage: 'Je suis intéressé par...',
      lastMessageTimestamp: new Date(),
      type: 'influencer',
      imageUrl: 'https://via.placeholder.com/40?text=Profile',
      isOnline: true,
      messages: []
    }
  ];

  filteredConversations: Conversation[] = [...this.conversations];
  selectedConversation: Conversation | null = null;
  newMessage: string = '';
  searchQuery: string = '';
  showMenu: boolean = false;
  contextMenuX: number = 0;
  contextMenuY: number = 0;
  selectedMessageIndex: number | null = null;
  showConversationList: boolean = true; // Pour gérer l'affichage sur mobile
  isTyping: boolean = false; // Indicateur de saisie
  private typingSubscription: Subscription | null = null;

  constructor(private messagingService: MessagingService, private ngZone: NgZone) {}

  ngAfterViewChecked() {
    this.scrollToBottom(); // Défilement automatique après chaque mise à jour
  }

  selectConversation(conversation: Conversation) {
    this.selectedConversation = conversation;
    this.showConversationList = false; // Masquer la liste sur mobile
    this.hideContextMenu();
    this.subscribeToTyping(); // S'abonner aux événements de saisie
  }

  sendMessage() {
    if (this.newMessage.trim() && this.selectedConversation) {
      this.messagingService.sendMessage(this.selectedConversation.id, this.newMessage).subscribe({
        next: (response) => {
          this.selectedConversation!.messages.push({
            id: response.id,
            content: this.newMessage,
            timestamp: new Date(),
            isSentByMe: true,
            status: 'sent'
          });
          this.selectedConversation!.lastMessage = this.newMessage;
          this.selectedConversation!.lastMessageTimestamp = new Date();
          this.newMessage = '';
          this.filterConversations();
          this.scrollToBottom();
        },
        error: (error) => console.error('Erreur envoi message', error)
      });
    }
  }

  filterConversations() {
    if (this.searchQuery.trim()) {
      this.filteredConversations = this.conversations.filter(conversation =>
        conversation.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      this.filteredConversations = [...this.conversations];
    }
  }

  showContextMenu(event: MouseEvent, index: number, target: EventTarget | null) {
    event.preventDefault();
    this.showMenu = true;
    this.selectedMessageIndex = index;

    const targetElement = target as HTMLElement;
    const messageRect = targetElement.getBoundingClientRect();
    const containerRect = this.messageContainer.nativeElement.getBoundingClientRect();

    this.contextMenuX = messageRect.left - containerRect.left;
    this.contextMenuY = messageRect.bottom - containerRect.top + 5;
  }

  hideContextMenu() {
    this.showMenu = false;
    this.selectedMessageIndex = null;
  }

  deleteMessage(index: number | null) {
    if (this.selectedConversation && index !== null) {
      const message = this.selectedConversation.messages[index];
      if (message.id) {
        this.messagingService.deleteMessage(message.id).subscribe({
          next: () => {
            this.selectedConversation!.messages.splice(index, 1);
            this.updateLastMessage();
            this.hideContextMenu();
          },
          error: (error) => console.error('Erreur suppression message', error)
        });
      } else {
        this.selectedConversation!.messages.splice(index, 1);
        this.updateLastMessage();
        this.hideContextMenu();
      }
    }
  }

  copyMessage(index: number | null) {
    if (this.selectedConversation && index !== null) {
      const message = this.selectedConversation.messages[index].content;
      navigator.clipboard.writeText(message).then(() => {
        alert('Message copié dans le presse-papiers !');
      });
      this.hideContextMenu();
    }
  }

  forwardMessage(index: number | null) {
    if (this.selectedConversation && index !== null) {
      const message = this.selectedConversation.messages[index];
      if (message.id) {
        this.messagingService.forwardMessage(message.id, 1).subscribe({
          next: (response) => {
            alert(`Message partagé : ${message.content}`);
            this.hideContextMenu();
          },
          error: (error) => console.error('Erreur partage message', error)
        });
      }
    }
  }

  startNewConversation() {
    // À implémenter : logique pour démarrer une nouvelle conversation
    console.log('Démarrer une nouvelle conversation');
  }

  startAudioCall() {
    // À implémenter : logique pour un appel audio
    console.log('Lancer un appel audio');
  }

  startVideoCall() {
    // À implémenter : logique pour un appel vidéo
    console.log('Lancer un appel vidéo');
  }

  showConversationInfo() {
    // À implémenter : afficher les informations de la conversation
    console.log('Afficher les informations de la conversation');
  }

  addAttachment() {
    // À implémenter : logique pour ajouter une pièce jointe
    console.log('Ajouter une pièce jointe');
  }

  openEmojiPicker() {
    // À implémenter : ouvrir un sélecteur d'emojis
    console.log('Ouvrir le sélecteur d\'emojis');
  }

  onMessageInput() {
    // Notifier le service que l'utilisateur tape
    if (this.selectedConversation) {
      this.messagingService.sendTypingStatus(this.selectedConversation.id, true);
    }
  }

  private scrollToBottom() {
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        const container = this.messageContainer.nativeElement;
        container.scrollTop = container.scrollHeight;
      }, 0);
    });
  }

  private updateLastMessage() {
    if (this.selectedConversation) {
      const lastMessage = this.selectedConversation.messages[this.selectedConversation.messages.length - 1];
      this.selectedConversation.lastMessage = lastMessage ? lastMessage.content : '';
      this.selectedConversation.lastMessageTimestamp = lastMessage ? lastMessage.timestamp : undefined;
      this.filterConversations();
    }
  }

  private subscribeToTyping() {
    if (this.typingSubscription) {
      this.typingSubscription.unsubscribe();
    }
    if (this.selectedConversation) {
      this.typingSubscription = this.messagingService.getTypingStatus(this.selectedConversation.id).subscribe(isTyping => {
        this.isTyping = isTyping;
      });
    }
  }

  ngOnDestroy() {
    if (this.typingSubscription) {
      this.typingSubscription.unsubscribe();
    }
  }
}