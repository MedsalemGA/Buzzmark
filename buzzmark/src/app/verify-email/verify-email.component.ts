import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    NgIf,
    NgFor
  ],
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent implements OnInit {
  code: string = '';
  codeError: boolean = false;
  email: string = '';

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.email = this.route.snapshot.queryParams['email'] || '';
  }
  loading: boolean = false;

 onSubmit() {
  this.codeError = !this.code;

  if (!this.codeError) {
    this.loading = true;
    this.http.post('http://localhost:8000/api/verify-email', {
      email: this.email,
      code: this.code
    }).subscribe({
      next: (response: any) => {
        this.loading = false;

        // 🔥 ENREGISTRER LE TOKEN
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('client_type', response.client_type);

        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Votre email a été vérifié avec succès.',
          confirmButtonText: 'Continuer'
        }).then(() => {
          this.router.navigate(['/dashboard/entreprise']);
        });
      },
      error: (error) => {
        this.loading = false;
        this.codeError = true;
        Swal.fire({
          icon: 'error',
          title: 'Erreur de vérification',
          text: error.error?.message || 'Code incorrect ou expiré.',
          confirmButtonText: 'Réessayer',
          timer: 3000
        });
      }
    });
  } else {
    Swal.fire({
      icon: 'warning',
      title: 'Champ manquant',
      text: 'Veuillez entrer le code de vérification.',
      confirmButtonText: 'OK',
      timer: 3000
    });
  }
}



  resendCode() {
    this.http.post('http://localhost:8000/api/resend-verification', { email: this.email }).subscribe({
      next: (response: any) => {
        Swal.fire({
          icon: 'success',
          title: 'Code renvoyé',
          text: 'Un nouveau code a été envoyé à votre adresse email.',
          confirmButtonText: 'OK',
          timer:3000
        });
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: error.error?.message || 'Impossible d’envoyer le code. Vérifiez l’email.',
          confirmButtonText: 'OK',
          timer:3000
        });
      }
    });
  }
}
