import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router,ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NgFor, NgIf } from '@angular/common';
import { MatToolbar } from "@angular/material/toolbar";
import { MatDatepickerModule } from '@angular/material/datepicker';
import Swal from 'sweetalert2';
import { OnInit } from '@angular/core';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    FormsModule,
    RouterLink,
    MatSnackBarModule,
    NgFor,
    NgIf,
    MatToolbar,
    MatDatepickerModule,
    
],
  templateUrl: './skip.component.html',
  styleUrls: ['./skip.component.css']
})
export class SkipComponent implements OnInit {
   fullText: string = 'Make your brand shine with Buzzmark';
  displayedText: string = '';
  currentIndex: number = 0;

  ngOnInit(): void {
    this.startTyping();
  }

  startTyping(): void {
    if (this.currentIndex < this.fullText.length) {
      this.displayedText += this.fullText.charAt(this.currentIndex);
      this.currentIndex++;
      setTimeout(() => this.startTyping(), 70); // 100ms entre chaque lettre
    }
  }

 
 plan: string = 'classique';
  email: string = '';
  clientType: string = '';
  skipData: any = {};
  errorMessage: any;

 constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      this.clientType = params['client_type'] || '';
      console.log('Paramètres reçus:', { email: this.email, clientType: this.clientType });
    });
  }


  

 onSkip() {
  const skipData = {
    email: this.email, // essentiel pour que le backend sache de quel utilisateur il s'agit
    phone_number: '', // vide mais requis côté backend
    address: '', 
    // vide mais requis côté backend
    // les autres restent vides ou non inclus (facultatif)
  };

  this.http.post('http://localhost:8000/api/skip', skipData).subscribe({
    next: (response: any) => {
      this.snackBar.open('Informations enregistrées', 'OK', { duration: 5000 });
      this.router.navigate(['/payment'], {
        queryParams: { email: this.email, client_type: this.clientType }
      });
    },
    error: (error) => {
      console.error('Erreur HTTP:', error);
      const errorMessage = error.error?.message || error.statusText || 'Erreur côté serveur.';
      this.snackBar.open(errorMessage, 'OK', { duration: 5000 });
    }
  });
}

  onSubmit() {
  const birthDate = this.skipData?.date_de_naissance 
  ? new Date(this.skipData.date_de_naissance)
  : null;

const today = new Date();
let ageValid = true;

if (birthDate) {
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  if (
    age < 18 ||
    (age === 18 && monthDiff < 0) ||
    (age === 18 && monthDiff === 0 && dayDiff < 0)
  ) {
    ageValid = false;
  }
}

if (this.clientType === 'influenceur' && birthDate && !ageValid) {
  Swal.fire({
    icon: 'warning',
    title: 'Âge minimum requis',
    text: 'Vous devez avoir au moins 18 ans pour vous inscrire comme influenceur.',
    confirmButtonColor: '#f4801a',
    confirmButtonText: 'Ok',
    timer: 3000,
  });
  return;
}
    const skipData = {
      email: this.email,
      phone_number: this.skipData.phone_number,
      address: this.skipData.address,
      ...(this.clientType === 'entreprise' ? {
        logo: this.skipData.logo,
        secteur: this.skipData.secteur,
        numero_commercial: this.skipData.numero_commercial
      } : {}),
      ...(this.clientType === 'influenceur' ? {
          photo_de_profil: this.skipData.photo_de_profil,
          date_de_naissance: this.skipData.date_de_naissance,
          

        } : {})
    };
      this.http.post('http://localhost:8000/api/skip', skipData).subscribe({
        next: (response: any) => {
          const message = response.message.includes('email a échoué') 
            ? 'Inscription enregistrée, mais vérifiez votre boîte de réception ou demandez un nouveau code.'
            : 'Inscription enregistrée ! Choisissez un abonnement.';
          this.snackBar.open(message, 'OK', { duration: 5000 });
          this.router.navigate(['/payment'], { queryParams: { email: this.email, client_type: this.clientType } });
        },
        error: (error) => {
          console.error('Erreur HTTP:', error);
          const errorMessage = error.error?.message || error.statusText || 'Erreur lors de la connexion au serveur. Vérifiez que le backend est démarré.';
          this.errorMessage = errorMessage;
          this.snackBar.open(errorMessage, 'OK', { duration: 5000 });
        }
      });
    } 
  }
