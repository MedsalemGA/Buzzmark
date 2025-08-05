import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { MatRadioModule } from '@angular/material/radio';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    FormsModule,
    MatRadioModule
  ],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent {
  plan: string = '';
  selectedDuration: string = '';
  email: string = '';
  clientType: string = '';
  cardNumber: string = '';
  cardExpiry: string = '';
  cardCvv: string = '';
  isLoading: boolean = false;

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

  selectPlan(planType: string) {
    this.plan = planType;
    this.selectedDuration = ''; // reset duration when changing plan
  }

  async onSubmit() {
    this.isLoading = true;

    console.log('Début du paiement:', {
      email: this.email,
      clientType: this.clientType,
      plan: this.plan,
      duration: this.selectedDuration,
      cardNumber: this.cardNumber,
      cardExpiry: this.cardExpiry,
      cardCvv: this.cardCvv
    });

    if (
      !this.email ||
      !this.clientType ||
      !this.plan ||
      !this.selectedDuration ||
      !this.cardNumber ||
      !this.cardExpiry ||
      !this.cardCvv
    ) {
      this.snackBar.open('Please complete all fields', 'OK', { duration: 5000 });
      this.isLoading = false;
      return;
    }

    const data = {
      email: this.email,
      client_type: this.clientType,
      plan: this.plan,
      duration: this.selectedDuration,
      card_number: this.cardNumber,
      card_expiry: this.cardExpiry,
      card_cvv: this.cardCvv
    };

    try {
      const response: any = await this.http.post('http://localhost:8000/api/process-payment', data).toPromise();
      console.log('Réponse process-payment:', response);

      await Swal.fire({
        icon: 'success',
        title: 'Payment Successful!',
        text: `Your ${this.plan} subscription for ${this.selectedDuration} is now active.`,
        confirmButtonColor: '#f4801a',
        confirmButtonText: 'Continue',
        timer: 3000
      });

   if (response.redirect_url.includes('/verify-email')) {
    
  await this.router.navigate(['/verify-email'], {
    queryParams: { email: this.email }
  });
} else if (response.redirect_url.includes('/dashboard/entreprise')) {
  this.router.navigate(['/dashboard/entreprise'], { queryParams: { client_type: this.clientType } });
}
       else {
        console.error('redirect_url manquant dans la réponse:', response);
        this.snackBar.open('Error: Missing redirect URL in response', 'OK', { duration: 5000 });
      }
    } catch (error: any) {
      console.error('Erreur lors du paiement:', error);
      this.snackBar.open(error.error?.message || 'Payment processing error', 'OK', { duration: 5000 });
    } finally {
      this.isLoading = false;
    }
  }
  pricing: Record<string, Record<string, number>> = {
  Basic: {
    '1month': 3.2,
    '6months': 3.2 * 6 * 0.85, // 15% de réduction
    '1year': 3.2 * 12 * 0.7    // 30% de réduction
  },
  Premium: {
    '1month': 8,
    '6months': 8 * 6 * 0.85,
    '1year': 8 * 12 * 0.7
  },
  VIP: {
    '1month': 19,
    '6months': 19 * 6 * 0.85,
    '1year': 19 * 12 * 0.7
  }
};

getPrice(): number | null {
  if (this.plan && this.selectedDuration) {
    return this.pricing[this.plan]?.[this.selectedDuration] ?? null;
  }
  return null;
}
}
