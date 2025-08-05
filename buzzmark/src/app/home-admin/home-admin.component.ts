import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import{ CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-admin',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './home-admin.component.html',
  styleUrls: ['./home-admin.component.css']
})
export class HomeAdminComponent {
  pageTitle: string = 'Tableau de bord';
  pageIcon: string = 'ri-dashboard-line';
  adminName: string = 'Gafsi Mohamed Salem';
  isSidebarActive: boolean = false;
  isDarkMode: boolean = document.body.classList.contains('dark-mode');

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        switch (event.urlAfterRedirects) {
          case '/dashboard':
            this.pageTitle = 'Tableau de bord';
            this.pageIcon = 'ri-dashboard-line';
            break;
          case '/entreprises':
            this.pageTitle = 'Entreprises/Marques';
            this.pageIcon = 'ri-building-line';
            break;
          case '/influenceurs':
            this.pageTitle = 'Influenceurs';
            this.pageIcon = 'ri-user-star-line';
            break;
          case '/messagerie':
            this.pageTitle = 'Messagerie';
            this.pageIcon = 'ri-mail-line';
            break;
          case '/offres':
            this.pageTitle = 'Offres';
            this.pageIcon = 'ri-price-tag-3-line';
            break;
          case '/postulations':
            this.pageTitle = 'Postulations';
            this.pageIcon = 'ri-file-user-line';
            break;
          case '/configuration':
            this.pageTitle = 'Configuration';
            this.pageIcon = 'ri-settings-3-line';
            break;
          default:
            this.pageTitle = 'Tableau de bord';
            this.pageIcon = 'ri-dashboard-line';
        }
      }
    });
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode', this.isDarkMode);
  }

  toggleSidebar() {
    this.isSidebarActive = !this.isSidebarActive;
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.toggle('active', this.isSidebarActive);
    }
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.classList.toggle('sidebar-active', this.isSidebarActive);
    }
  }

  logout() {
    console.log('Déconnexion');
    this.router.navigate(['/login']);
  }
}