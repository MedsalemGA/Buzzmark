import { ApplicationConfig } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { ProfileSetupComponent } from './profile-setup/profile-setup.component';
import { PaymentComponent } from './payment/payment.component';
import { HomeEntrepriseComponent } from './home-entreprise/home-entreprise.component';
import { CampaignsComponent } from './campaigns/campaigns.component';
import { OffersComponent } from './offers/offers.component';
import { CollaboratorsComponent } from './collaborators/collaborators.component';
import { MessagingComponent } from './messaging/messaging.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { AccountComponent } from './account/account.component';
import { SkipComponent } from './skip/skip.component';
import { provideNativeDateAdapter } from '@angular/material/core';
import { HomeAdminComponent } from './home-admin/home-admin.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EntreprisesComponent } from './entreprises/entreprises.component';
import { InfluenceursComponent } from './influenceurs/influenceurs.component';
import { OffresComponent } from './offres/offres.component';
import { PostulationsComponent } from './postulations/postulations.component';
import { ConfigurationComponent } from './configuration/configuration.component';
import { AboutComponent } from './about/about.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
const routes: Routes = [
  { path: '', component: HomeComponent },
   { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verify-email', component: VerifyEmailComponent },
  { path: 'profile-setup', component: ProfileSetupComponent },
  { path: 'payment', component: PaymentComponent },
    { path: 'about', component: AboutComponent },
  
  {
    path: 'dashboard/entreprise',
    component: HomeEntrepriseComponent,
    children: [
      { path: 'campaigns', component: CampaignsComponent },
      { path: 'offers', component: OffersComponent },
      { path: 'collaborators', component: CollaboratorsComponent },
      { path: 'messaging', component: MessagingComponent },
      { path: 'notifications', component: NotificationsComponent },
      { path: 'account', component: AccountComponent },
      { path: '', redirectTo: 'campaigns', pathMatch: 'full' }
    ]
  },
  {
    path: 'admin',
    component: HomeAdminComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'entreprises', component: EntreprisesComponent },
      { path: 'influenceurs', component: InfluenceursComponent },
      { path: 'messaging', component: MessagingComponent },
      { path: 'offres', component: OffresComponent },
      { path: 'postulations', component: PostulationsComponent },
      { path: 'configuration', component: ConfigurationComponent }
    ]
  },

  { path: 'skip', component: SkipComponent },
  { path: '**', redirectTo: '' },
  { path: 'about', component: AboutComponent },
  

];

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(),
     provideNativeDateAdapter(),
    
    
  ]
};