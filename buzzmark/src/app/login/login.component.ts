import { Component } from '@angular/core';
   import { MatCardModule } from '@angular/material/card';
   import { MatFormFieldModule } from '@angular/material/form-field';
   import { MatInputModule } from '@angular/material/input';
   import { MatButtonModule } from '@angular/material/button';
   import { MatSelectModule } from '@angular/material/select';
   import { FormsModule } from '@angular/forms';
   import { HttpClient } from '@angular/common/http';
   import { MatSnackBar } from '@angular/material/snack-bar';
   import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatToolbarModule, MatToolbar } from '@angular/material/toolbar';
import { NgFor, NgIf } from '@angular/common';
import Swal from 'sweetalert2';
import { MatIconModule } from '@angular/material/icon';

   @Component({
     selector: 'app-login',
     standalone: true,
     imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    FormsModule,
    MatToolbar,
    RouterModule,
    NgIf,
    NgFor,
    MatIconModule
],
     templateUrl: './login.component.html',
     styleUrls: ['./login.component.css']
   })
   export class LoginComponent {
     usernameOrEmail: string = '';
     password: string = '';
     clientType: string = '';
     usernameOrEmailError: string = '';
     passwordError: string = '';
     clientTypeError: string = '';
     hidePassword: boolean = true;

     constructor(
       private http: HttpClient,
       private snackBar: MatSnackBar,
       private router: Router,
       private route: ActivatedRoute
     ) {
       this.route.queryParams.subscribe(params => {
         this.usernameOrEmail = params['email'] || '';
         this.clientType = params['client_type'] || '';
       });
     }
    togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }
   onSubmit() {
  const data = {
    usernameOrEmail: this.usernameOrEmail,
    password: this.password,
    client_type: this.clientType
  };

  this.http.post('http://localhost:8000/api/login', data).subscribe({
    next: (response: any) => {
      localStorage.setItem('auth_token', response.token); // Stocker le token

      const expiresAt = response.user.subscription_expires_at;

      // Vérifie si l'abonnement est expiré
      if (expiresAt && new Date(expiresAt) < new Date()) {
        localStorage.setItem('subscription_expired', 'true');
        
        Swal.fire({
          title: 'Abonnement expiré',
          text: 'Votre abonnement est expiré. Veuillez le renouveler pour continuer.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Renouveler maintenant',
          cancelButtonText: 'Ignorer',
          allowOutsideClick: false,
          allowEscapeKey: false
        }).then(result => {
          if (result.isConfirmed) {
             this.router.navigate(['/payment'], { queryParams: { email: this.usernameOrEmail, client_type: this.clientType} });
          } else {
            this.snackBar.open('Connecté, mais accès limité', 'OK', { duration: 3000 });
            this.router.navigate(['/dashboard/entreprise'], { queryParams: { client_type: response.user.client_type } });
          }
        });
      } else {
        localStorage.removeItem('subscription_expired'); // abonnement valide
        this.snackBar.open('Connexion réussie', 'OK', { duration: 3000 });
        this.router.navigate(['/dashboard/entreprise'], { queryParams: { client_type: response.user.client_type } });
      }
    },
    error: (error) => {
      console.error('Erreur de connexion:', error);
      this.snackBar.open(error.error.message || 'Erreur lors de la connexion', 'OK', { duration: 3000 });
    }
  });
}}