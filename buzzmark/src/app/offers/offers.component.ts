import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, CurrencyPipe, formatDate } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatDatepickerModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    CurrencyPipe
  ],
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.css'],
  providers: [provideNativeDateAdapter()],
})
export class OffersComponent implements OnInit, OnDestroy {
  offers: any[] = [];
  companies: any[] = [];
  searchQuery: string = '';
  sortBy: string = 'created_at';
  statusFilter: string = 'all';
  minBudget: number | null = null;
  maxBudget: number | null = null;
  startDate: string = '';
  endDate: string = '';
  statuses = ['all', 'active', 'pending', 'expired', 'completed'];
  showCreateForm: boolean = false;
  loading: boolean = false; // Track loading state for actions
  newOffer = {
    id: null,
    name: '',
    budget: 0,
    deadline: '',
    status: 'pending',
    views: 0,
    shares: 0,
    interactions: 0
  };
  selectedOffer: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    console.log('Composant Offers chargé');
    this.fetchOffersData();
  }

  ngOnDestroy(): void {
    // Cleanup if necessary
  }

  fetchOffersData(): void {
    if (this.loading) return; // Prevent concurrent requests
    this.loading = true;
    const token = localStorage.getItem('auth_token');
    if (token) {
      const params: any = {
        sort: this.sortBy,
        search: this.searchQuery
      };

      if (this.statusFilter !== 'all') {
        params.status = this.statusFilter;
      }
      if (this.minBudget !== null) params.min_budget = this.minBudget;
      if (this.maxBudget !== null) params.max_budget = this.maxBudget;
      if (this.startDate) params.start_date = this.formatDate(this.startDate);
      if (this.endDate) params.end_date = this.formatDate(this.endDate);

      this.http.get('http://localhost:8000/api/offers', {
        headers: { Authorization: `Bearer ${token}` },
        params
      }).subscribe({
        next: (response: any) => {
          this.offers = response.offers || [];
          console.log('Offres récupérées:', this.offers);
         
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors de la récupération des offres:', error);
          this.loading = false;
          if (error.status === 401) {
            this.refreshToken();
          }
        }
      });
    } else {
      console.error('Aucun token d\'authentification trouvé.');
      this.refreshToken();
      this.loading = false;
    }
  }

 

  onFilterChange(): void {
    this.fetchOffersData();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.statusFilter = 'all';
    this.minBudget = null;
    this.maxBudget = null;
    this.startDate = '';
    this.endDate = '';
    this.sortBy = 'created_at';
    this.fetchOffersData();
  }

  createNewCampaign(): void {
    console.log('Bouton Nouvelle campagne cliqué');
    this.showCreateForm = true;
    this.newOffer = {
      id: null,
      name: '',
      budget: 0,
      deadline: '',
      status: 'pending',
      views: 0,
      shares: 0,
      interactions: 0
    };
    this.selectedOffer = null;
  }

  onSubmitNewOffer(): void {
    if (this.loading) return;
    this.loading = true;
    const token = localStorage.getItem('auth_token');
    if (token) {
      const formattedDeadline = this.formatDate(this.newOffer.deadline);
      const data = {
        name: this.newOffer.name,
        budget: this.newOffer.budget,
        deadline: formattedDeadline,
        status: this.newOffer.status,
        views: this.newOffer.views,
        shares: this.newOffer.shares,
        interactions: this.newOffer.interactions
      };

      if (this.newOffer.id) {
        this.http.put(`http://localhost:8000/api/offers/${this.newOffer.id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        }).subscribe({
          next: (response) => {
            console.log('Offre mise à jour:', response);
            this.showCreateForm = false;
            this.newOffer = {
              id: null,
              name: '',
              budget: 0,
              deadline: '',
              status: 'pending',
              views: 0,
              shares: 0,
              interactions: 0
            };
            this.fetchOffersData();
          },
          error: (error) => {
            console.error('Erreur lors de la mise à jour:', error);
            this.loading = false;
            if (error.status === 401) {
              this.refreshToken();
            }
          }
        });
      } else {
        this.http.post('http://localhost:8000/api/offers', data, {
          headers: { Authorization: `Bearer ${token}` }
        }).subscribe({
          next: (response) => {
            console.log('Offre créée:', response);
            this.showCreateForm = false;
            this.newOffer = {
              id: null,
              name: '',
              budget: 0,
              deadline: '',
              status: 'pending',
              views: 0,
              shares: 0,
              interactions: 0
            };
            this.fetchOffersData();
          },
          error: (error) => {
            console.error('Erreur lors de la création:', error);
            this.loading = false;
            if (error.status === 401) {
              this.refreshToken();
            }
          }
        });
      }
    } else {
      console.error('Aucun token d\'authentification trouvé.');
      this.refreshToken();
      this.loading = false;
    }
  }

  cancelCreate(): void {
    this.showCreateForm = false;
    this.newOffer = {
      id: null,
      name: '',
      budget: 0,
      deadline: '',
      status: 'pending',
      views: 0,
      shares: 0,
      interactions: 0
    };
    this.selectedOffer = null;
  }

  refreshToken(): void {
    this.loading = true;
    this.http.get('http://localhost:8000/api/get-token', {
      headers: { Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}` }
    }).subscribe({
      next: (response: any) => {
        localStorage.setItem('auth_token', response.token);
        this.fetchOffersData();
      },
      error: (error) => {
        console.error('Erreur lors du rafraîchissement du token:', error);
        this.loading = false;
      }
    });
  }

  private formatDate(date: string): string {
    if (date) {
      const dateObj = new Date(date);
      return dateObj.toISOString().split('T')[0];
    }
    return '';
  }

  editOffer(offer: any): void {
    this.selectedOffer = { ...offer };
    this.newOffer = { ...offer };
    this.showCreateForm = true;
    console.log('Modifier l\'offre:', offer);
  }

  completeOffer(offer: any): void {
    if (this.loading || !offer || !offer.id) {
      console.error('Impossible de terminer l\'offre:', { loading: this.loading, offer });
      return;
    }
    this.loading = true;
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.http.put(`http://localhost:8000/api/offers/${offer.id}`, {
        status: 'completed',
        
        
      }, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: (response) => {
          console.log(`Offre ${offer.id} terminée:`, response);
          this.loading = false;
          this.fetchOffersData();
        },
        error: (error) => {
          console.error(`Erreur lors de la mise à jour de l'offre ${offer.id}:`, error);
          this.loading = false;
          if (error.status === 401) {
            this.refreshToken();
          }
        }
      });
    } else {
      console.error('Aucun token d\'authentification trouvé.');
      this.refreshToken();
      this.loading = false;
    }
  }
}