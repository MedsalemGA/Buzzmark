
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import{ MatToolbarModule } from '@angular/material/toolbar';
import{RouterLink} from '@angular/router';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  imports: [CommonModule,MatToolbarModule,RouterLink,],
  styleUrls: ['./about.component.css']
})
export class AboutComponent {
  teamMembers = [
    { name: 'Gafsi Mohamed Salem', role: 'CEO & Founder', image: '/salem.png' },
    { name: 'Med chou', role: 'Creative Director', image: '/med.jpg' },
    { name: 'Lionel Messi', role: 'Lead Developer', image: '/messi.jpg' }
  ];
}