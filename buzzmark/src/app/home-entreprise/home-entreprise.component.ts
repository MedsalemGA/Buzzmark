
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { RouterOutlet } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home-entreprise',
  standalone: true,
  imports: [CommonModule, MatCardModule, RouterOutlet],
  templateUrl: './home-entreprise.component.html',
  styleUrls: ['./home-entreprise.component.css']
})
export class HomeEntrepriseComponent implements OnInit {
  isSidebarOpen = false;
  isDarkMode = false;
  companyName = 'Loading...';

  constructor(private router: Router, private http: HttpClient) {
    this.initializeDarkMode();
  }

  ngOnInit(): void {
    this.fetchCompanyName();
  }

  private initializeDarkMode(): void {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      this.isDarkMode = savedDarkMode === 'true';
    } else {
      this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    this.applyDarkMode();
  }

  private applyDarkMode(): void {
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  navigateTo(route: string): void {
    this.router.navigate(['/dashboard/entreprise', route]).then(success => {
   
  })}

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', this.isDarkMode.toString());
    this.applyDarkMode();
   
    };
  

  logout(): void {
    Swal.fire({
      title: 'Logout',
      text: 'Are you sure to Disconnect ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes,Disconnect',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ff661a',
      
      cancelButtonColor: '#6b7280',
      
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('auth_token');
        this.router.navigate(['/home']).then(() => {
          Swal.fire({
            title: 'Disconnected',
            text: 'You have been disconnected successfully.',
            icon: 'success',
            timer: 2500,
            showConfirmButton: false,
            confirmButtonColor: '#ff661a',
            
          });
        });
      }
    });
  }

  fetchCompanyName() {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      Swal.fire({
        title: 'Erreur',
        text: 'Aucun jeton d’authentification trouvé. Veuillez vous reconnecter.',
        icon: 'error',
        confirmButtonColor: '#ff661a'
      });
      this.companyName = 'No Company';
      this.router.navigate(['/home']);
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<{ company_name: string }>(
      'http://localhost:8000/api/company-info',
      { headers }
    ).subscribe({
      next: (res) => {
        this.companyName = res.company_name || 'Unnamed Company';
        console.log('Company info response:', res); // Debug
        
     
      },
      error: (err) => {
        console.error('Error fetching company name:', err);
        Swal.fire({
          title: 'Erreur',
          text: 'Erreur lors du chargement du nom de l’entreprise.',
          icon: 'error',
          confirmButtonColor: '#ff661a'
        });
        this.companyName = 'Error Loading Company';
      }
    });
  }
}