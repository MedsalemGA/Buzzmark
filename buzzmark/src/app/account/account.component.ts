import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {
  user: any = {};
  userForm!: FormGroup;
  showPassword: boolean = false;

  // Define SweetAlert2 toast mixin for consistent styling
  private swalToast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
    customClass: {
      popup: 'swal2-custom-toast',
      title: 'swal2-custom-title',
      htmlContainer: 'swal2-content'
    }
  });

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      phone_number: ['', [Validators.required, Validators.pattern(/^\+[1-9]\d{1,14}$/)]],
      address: ['', Validators.required],
      company_name: [''],
      industry: [''],
      numero_commercial: [''],
      logo: ['', Validators.pattern(/^https?:\/\/.+/i)],
      full_name: [''],
      tiktok_url: ['', Validators.pattern(/^https?:\/\/(www\.)?tiktok\.com\/.+/i)],
      instagram_url: ['', Validators.pattern(/^https?:\/\/(www\.)?instagram\.com\/.+/i)],
      youtube_url: ['', Validators.pattern(/^https?:\/\/(www\.)?youtube\.com\/.+/i)],
      photo_de_profil: ['', Validators.pattern(/^https?:\/\/.+/i)],
      
    });
  }

  ngOnInit(): void {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      Swal.fire({
        title: 'Authentication Error',
        text: 'No authentication token found. Please log in again.',
        icon: 'error',
        confirmButtonColor: '#ff661a',
        customClass: {
          popup: 'swal2-custom-popup',
          title: 'swal2-custom-title',
          htmlContainer: 'swal2-content'
        }
      }).then(() => {
        this.router.navigate(['/login']);
      });
      return;
    }

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<any>('http://localhost:8000/api/user', { headers }).subscribe({
      next: (data) => {
        this.user = data.user;
        const userData = {
          ...data.user,
          ...(data.company || {}),
          ...(data.influencer || {}),
          password: ''
        };
        console.log('userData:', userData);

        this.userForm.patchValue(userData);
        this.updateFormControls(data.user.client_type);

        // Set validators based on client_type
        if (data.user.client_type === 'entreprise') {
          this.userForm.get('company_name')?.setValidators([Validators.required]);
          this.userForm.get('full_name')?.clearValidators();
        } else if (data.user.client_type === 'influencer') {
          this.userForm.get('full_name')?.setValidators([Validators.required]);
          this.userForm.get('company_name')?.clearValidators();
        }
        this.userForm.get('company_name')?.updateValueAndValidity();
        this.userForm.get('full_name')?.updateValueAndValidity();

        this.swalToast.fire({
          title: 'Success',
          text: 'User data loaded successfully.',
          icon: 'success'
        });
      },
      error: (error) => {
        console.error('Error fetching user data:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to load user data. Please log in again.',
          icon: 'error',
          confirmButtonColor: '#ff661a',
          customClass: {
            popup: 'swal2-custom-popup',
            title: 'swal2-custom-title',
            htmlContainer: 'swal2-content'
          }
        }).then(() => {
          this.router.navigate(['/login']);
        });
      }
    });
  }

  private updateFormControls(clientType: string): void {
    if (clientType === 'entreprise') {
      this.userForm.get('full_name')?.disable();
      this.userForm.get('tiktok_url')?.disable();
      this.userForm.get('instagram_url')?.disable();
      this.userForm.get('youtube_url')?.disable();
      this.userForm.get('photo_de_profil')?.disable();
      this.userForm.get('company_name')?.enable();
      this.userForm.get('industry')?.enable();
      this.userForm.get('numero_commercial')?.enable();
      this.userForm.get('logo')?.enable();
    } else if (clientType === 'influencer') {
      this.userForm.get('company_name')?.disable();
      this.userForm.get('industry')?.disable();
      this.userForm.get('numero_commercial')?.disable();
      this.userForm.get('logo')?.disable();
      this.userForm.get('full_name')?.enable();
      this.userForm.get('tiktok_url')?.enable();
      this.userForm.get('instagram_url')?.enable();
      this.userForm.get('youtube_url')?.enable();
      this.userForm.get('photo_de_profil')?.enable();
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  saveChanges(): void {
    if (this.userForm.invalid) {
      Swal.fire({
        title: 'Invalid Form',
        text: 'Please fill all required fields correctly.',
        icon: 'warning',
        confirmButtonColor: '#ff661a',
        customClass: {
          popup: 'swal2-custom-popup',
          title: 'swal2-custom-title',
          htmlContainer: 'swal2-content'
        }
      });
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (!token) {
      Swal.fire({
        title: 'Session Expired',
        text: 'Your session has expired. Please log in again.',
        icon: 'error',
        confirmButtonColor: '#ff661a',
        customClass: {
          popup: 'swal2-custom-popup',
          title: 'swal2-custom-title',
          htmlContainer: 'swal2-content'
        }
      }).then(() => {
        this.router.navigate(['/login']);
      });
      return;
    }

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    const formValue = { ...this.userForm.getRawValue() };
    const payload = {
      client_type: this.user.client_type,
      email: formValue.email,
      phone_number: formValue.phone_number,
      address: formValue.address,
      subscription_plan: formValue.subscription_plan,
      ...(formValue.password && { password: formValue.password }),
      ...(this.user.client_type === 'entreprise' && {
        ...(formValue.company_name && { company_name: formValue.company_name }),
        ...(formValue.industry && { industry: formValue.industry }),
        ...(formValue.numero_commercial && { numero_commercial: formValue.numero_commercial }),
        ...(formValue.logo && { logo: formValue.logo })
      }),
      ...(this.user.client_type === 'influencer' && {
        ...(formValue.full_name && { full_name: formValue.full_name }),
        ...(formValue.tiktok_url && { tiktok_url: formValue.tiktok_url }),
        ...(formValue.instagram_url && { instagram_url: formValue.instagram_url }),
        ...(formValue.youtube_url && { youtube_url: formValue.youtube_url }),
        ...(formValue.photo_de_profil && { photo_de_profil: formValue.photo_de_profil })
      })
    };

    console.log('Payload sent to server:', JSON.stringify(payload, null, 2));

    this.http.put('http://localhost:8000/api/user/update', payload, { headers }).subscribe({
      next: () => {
        this.swalToast.fire({
          title: 'Success',
          text: 'Changes saved successfully.',
          icon: 'success'
        });
      },
      error: (error) => {
        console.error('Update error:', error);
        const errorMessage = error.error?.errors
          ? Object.values(error.error.errors).flat().join(', ')
          : error.error?.message || 'Unknown error';
        Swal.fire({
          title: 'Error',
          text: `Failed to save changes: ${errorMessage}`,
          icon: 'error',
          confirmButtonColor: '#ff661a',
          customClass: {
            popup: 'swal2-custom-popup',
            title: 'swal2-custom-title',
            htmlContainer: 'swal2-content'
          }
        });
      }
    });
  }

  deleteAccount(): void {
    Swal.fire({
      title: 'Delete Account',
      text: 'Are you sure you want to delete your account? This action cannot be undone.',
      icon: 'warning',
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ff661a',
      cancelButtonColor: '#6b7280',
      buttonsStyling: true,
      customClass: {
        popup: 'swal2-custom-popup',
        title: 'swal2-custom-title',
        htmlContainer: 'swal2-content',
        confirmButton: 'swal2-confirm',
        cancelButton: 'swal2-cancel'
      },
      showClass: {
        popup: '' // Disable popup animation
      },
      hideClass: {
        popup: '' // Disable popup hide animation
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('auth_token');
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

        this.http.delete('http://localhost:8000/api/user/delete', { headers }).subscribe({
          next: () => {
            this.swalToast.fire({
              title: 'Success',
              text: 'Account deleted successfully.',
              icon: 'success'
            });
            localStorage.removeItem('auth_token');
            this.router.navigate(['/login']);
          },
          error: () => {
            Swal.fire({
              title: 'Error',
              text: 'Failed to delete account.',
              icon: 'error',
              confirmButtonColor: '#ff661a',
              customClass: {
                popup: 'swal2-custom-popup',
                title: 'swal2-custom-title',
                htmlContainer: 'swal2-content'
              }
            });
          }
        });
      }
    });
  }

  upgradeSubscription(): void {
    this.router.navigate(['/payment'], { queryParams: { email: this.user.email, client_type: this.user.client_type } });
  }
}
   