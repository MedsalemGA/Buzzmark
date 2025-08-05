import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

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
    CommonModule,
    MatToolbar,
    MatIconModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  clientType: string = '';
  companyName: string = '';
  email: string = '';
  secteur: string = '';
  password: string = '';
  ConfirmerPassword: string = '';
  tiktokUrl: string = '';
  instagramUrl: string = '';
  youtubeUrl: string = '';
  fullName: string = '';
  fullNameError: boolean = false;
  clientTypeError: boolean = false;
  companyNameError: boolean = false;
  emailError: boolean = false;
  passwordError: boolean = false;
  errorMessage: string = '';
  secteurError: boolean = false;
  confirmPasswordError: boolean = false;
  passwordStrength: 'Very Short' | 'Very Weak' | 'Weak' | 'Good' | 'Perfect' | null = null;
  passwordType: 'password' | 'text' = 'password';
  confirmPasswordType: 'password' | 'text' = 'password';

  constructor(private http: HttpClient, private router: Router, private snackBar: MatSnackBar) {}

  checkPasswordStrength() {
    const password = this.password;

    if (!password) {
      this.passwordStrength = null;
      return;
    }

    // Very Short: moins de 8 caractères
    if (password.length < 8) {
      this.passwordStrength = 'Very Short';
      return;
    }

    // Very Weak: 8 caractères ou plus, uniquement lettres minuscules ou majuscules
    const onlyLowerCase = /^[a-z]+$/.test(password);
    const onlyUpperCase = /^[A-Z]+$/.test(password);
    if (onlyLowerCase || onlyUpperCase) {
      this.passwordStrength = 'Very Weak';
      return;
    }

    // Weak: 8 caractères ou plus, lettres (même type) et chiffres
    const hasLettersAndNumbers = /^[a-zA-Z0-9]+$/.test(password) && /[0-9]/.test(password);
    if (hasLettersAndNumbers && !this.isComplexPassword(password)) {
      this.passwordStrength = 'Weak';
      return;
    }
if (this.isComplexPassword(password)) {
      this.passwordStrength = 'Perfect';
      return;
    }

    // Good: 8 caractères ou plus, lettres (minuscules et majuscules) et chiffres, ou lettres (même type), chiffres et caractères spéciaux
    const hasMixedCaseAndNumbers = /[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password);
    const hasSameCaseNumbersSpecial = /^[a-z0-9!@#$%^&*(),.?":{}|<>]+$/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password);
    if (hasMixedCaseAndNumbers || hasSameCaseNumbersSpecial) {
      this.passwordStrength = 'Good';
      return;
    }

    // Perfect: 8 caractères ou plus, lettres (minuscules et majuscules), chiffres et caractères spéciaux
    
    // Par défaut
    this.passwordStrength = 'Weak';
  }

  private isComplexPassword(password: string): boolean {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return hasUpperCase && hasLowerCase && hasDigit && hasSpecialChar;
  }

  getPasswordStrengthEmoji(): string {
    switch (this.passwordStrength) {
      case 'Very Short':
        return '😞';
      case 'Very Weak':
        return '🚫';
      case 'Weak':
        return '😐';
      case 'Good':
        return '😊';
      case 'Perfect':
        return '🌟';
      default:
        return '';
    }
  }

  togglePasswordVisibility() {
    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
  }

  toggleConfirmPasswordVisibility() {
    this.confirmPasswordType = this.confirmPasswordType === 'password' ? 'text' : 'password';
  }

  onClientTypeChange() {
    this.clientTypeError = false;
    this.companyNameError = false;
    this.emailError = false;
    this.passwordError = false;
    this.confirmPasswordError = false;
    this.fullNameError = false;
    this.errorMessage = '';
  }

  onSubmit() {
    // Validation
    this.clientTypeError = !this.clientType;
    this.companyNameError = this.clientType === 'entreprise' && !this.companyName;
    this.fullNameError = this.clientType === 'influenceur' && !this.fullName;
    this.emailError = !this.email || !this.email.includes('@');
    this.passwordError = !this.password || this.password.length < 8 || this.password !== this.ConfirmerPassword;
    this.confirmPasswordError = this.password !== this.ConfirmerPassword;

    // Vérifier si le mot de passe est "Very Short" ou "Very Weak"
    if (this.passwordStrength === 'Very Short' || this.passwordStrength === 'Very Weak') {
      this.passwordError = true;
      this.snackBar.open(
        this.passwordStrength === 'Very Short' 
          ? 'Password is too short (8 characters minimum).'
          : 'Password is too weak. Please include more character types.',
        'OK', 
        { duration: 3000 }
      );
      return;
    }

    if (!this.clientTypeError && !this.companyNameError && !this.emailError && !this.passwordError && !this.fullNameError && !this.confirmPasswordError) {
      const registerData = {
        client_type: this.clientType,
        email: this.email,
        password: this.password,
        ...(this.clientType === 'entreprise' ? { company_name: this.companyName } : {}),
        ...(this.clientType === 'influenceur' ? {
          tiktok_url: this.tiktokUrl,
          instagram_url: this.instagramUrl,
          youtube_url: this.youtubeUrl,
          full_name: this.fullName
        } : {})
      };

      this.http.post('http://localhost:8000/api/pre-register', registerData).subscribe({
        next: (response: any) => {
          const message = response.message.includes('email a échoué') 
            ? 'Registration recorded, but check your inbox or request a new code.'
            : 'Registration recorded! Choose a subscription.';
          this.snackBar.open(message, 'OK', { duration: 5000 });
          this.router.navigate(['/skip'], { queryParams: { email: this.email, client_type: this.clientType} });
        },
        error: (error) => {
          console.error('HTTP Error:', error);
          const errorMessage = error.error?.message || error.statusText || 'Error connecting to the server. Check if the backend is running.';
          this.errorMessage = errorMessage;
          this.snackBar.open(errorMessage, 'OK', { duration: 5000 });
        }
      });
    } else {
      this.snackBar.open('Please correct the errors in the form', 'OK', { duration: 3000 });
    }
  }
}