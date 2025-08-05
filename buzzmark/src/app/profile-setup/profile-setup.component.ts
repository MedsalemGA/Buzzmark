import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import{NgFor, NgIf, TitleCasePipe} from '@angular/common';

@Component({
  selector: 'app-profile-setup',
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    FormsModule,
    TitleCasePipe,
    NgIf,
   
  ],
  templateUrl: './profile-setup.component.html',
  styleUrls: ['./profile-setup.component.css']
})
export class ProfileSetupComponent implements OnInit {
  clientType: string = 'entreprise'; // À remplacer par une valeur dynamique (ex. depuis l'API)
  logoUrl: string = '';
  commercialNumber: string = '';
  address: string = '';
  description: string = '';
  fullName: string = '';
  biography: string = '';
  tiktokUrl: string = '';
  instagramUrl: string = '';
  youtubeUrl: string = '';
  commercialNumberError: boolean = false;
  fullNameError: boolean = false;

  constructor(private http: HttpClient, private router: Router, private snackBar: MatSnackBar) {}

  ngOnInit() {
    // TODO: Récupérer clientType depuis l'API ou le contexte utilisateur
  }

  onSubmit() {
       const profileData = {
         client_type: this.clientType,
         logo_url: this.logoUrl,
         commercial_number: this.clientType === 'entreprise' ? this.commercialNumber : null,
         address: this.address,
         description: this.description,
         full_name: this.clientType === 'influenceur' ? this.fullName : null,
         biography: this.biography,
         tiktok_url: this.tiktokUrl,
         instagram_url: this.instagramUrl,
         youtube_url: this.youtubeUrl
       };

       const token = localStorage.getItem('auth_token');
       if (!token) {
         console.error('Aucun token trouvé');
         this.snackBar.open('Veuillez vous connecter', 'OK', { duration: 3000 });
         this.router.navigate(['/login']);
         return;
       }

       const headers = new HttpHeaders({
         'Authorization': `Bearer ${token}`,
         'Content-Type': 'application/json'
       });

       this.http.post('http://localhost:8000/api/profile-setup', profileData, { headers })
         .subscribe({
           next: (response: any) => {
             this.snackBar.open('Profil mis à jour', 'OK', { duration: 3000 });
             this.router.navigate(['/dashboard']);
           },
           error: (error: any) => {
             console.error('Erreur HTTP:', error);
             this.snackBar.open(error.error.message || 'Erreur lors de la mise à jour du profil', 'OK', { duration: 3000 });
           }
         });
     }}