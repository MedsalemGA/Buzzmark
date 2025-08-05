import { Component, Inject, OnInit, AfterViewInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { NgForOf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';

 // ← cela suffit à supprimer l’erreur

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatCardModule, RouterLink, NgForOf, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {
  influencerCount: number = 0;
  companyCount: number = 0;
  displayInfluencerCount: number = 0;
  displayCompanyCount: number = 0;
  doubledCompanies: string[] = [];
  isPaused: boolean = false;

  companies: any[] = [];
  influencers: any[] = [];

  images: string[] = [
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSi1YUsojqPKLq9Z4Ey3w_TEJ-XZHA4Y4Jjuw&s',
    'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg',
    'https://upload.wikimedia.org/wikipedia/en/d/da/Puma_complete_logo.svg',
    'https://logos-world.net/wp-content/uploads/2020/04/McDonalds-Logo.png',
    'https://static.vecteezy.com/system/resources/previews/022/636/386/non_2x/starbucks-logo-starbucks-icon-transparent-free-png.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/MG_Motor_2021_logo.svg/1200px-MG_Motor_2021_logo.svg.png',
    'https://upload.wikimedia.org/wikipedia/fr/thumb/1/1d/Lamborghini-Logo.svg/672px-Lamborghini-Logo.svg.png',
    'https://upload.wikimedia.org/wikipedia/commons/f/f3/Logo_geant_2015_rvb.png',
    'https://upload.wikimedia.org/wikipedia/commons/f/fd/Zara_Logo.svg'
  ];

  slides = [
    {
      background: '/hero.webp',
      image: '/hero.webp',
      title: 'Buzzmark',
      description: 'Helping you make money is what we do.'
    },
    {
      background: '/hero2.webp',
      image: '/hero2.webp',
      title: 'AI Services',
      description: 'Market analytics, help, filters... All with AI'
    },
    {
      background: '/hero3.webp',
      image: './hero3.webp',
      title: 'Hey Influencers',
      description: 'Achieve glory by collaborating with legendary brands'
    }
  ];

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    this.fetchStats();
    this.doubledCompanies = [...this.images, ...this.images];
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        try {
          Swiper.use([Navigation, Pagination, Autoplay, EffectFade]);

          const swiperContainer = document.querySelector('.swiper');
          if (!swiperContainer) {
            console.error('Swiper container (.swiper) not found in DOM');
            return;
          }

          new Swiper('.swiper', {
            loop: true,
            autoplay: {
              delay: 5000,
              disableOnInteraction: false,
            },
            pagination: {
              el: '.swiper-pagination',
              clickable: true,
            },
            navigation: {
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev',
            },
            effect: 'fade',
            fadeEffect: {
              crossFade: true,
            },
            on: {
              init(this: any) {
                const activeSlide = this.slides[this.activeIndex];
                if (activeSlide) {
                  const bg = activeSlide.getAttribute('data-background') || 'https://via.placeholder.com/1200x800?text=Fallback';
                  activeSlide.style.setProperty('--background-image', `url(${bg})`);
                }
              },
              slideChange(this: any) {
                const activeSlide = this.slides[this.activeIndex];
                if (activeSlide) {
                  const bg = activeSlide.getAttribute('data-background') || 'https://via.placeholder.com/1200x800?text=Fallback';
                  activeSlide.style.setProperty('--background-image', `url(${bg})`);
                }
              }
            },
          });
        } catch (error) {
          console.error('Error initializing Swiper:', error);
        }
      }, 100);
    }
  }

  fetchStats(): void {
    this.http.get('http://localhost:8000/api/stats').subscribe((res: any) => {
      this.animateCount(res.influencers, 'influencer');
      this.animateCount(res.companies, 'company');
    });
  }

  animateCount(target: number, type: 'influencer' | 'company') {
    let count = 0;
    const step = Math.ceil(target / 50);
    const interval = setInterval(() => {
      count += step;
      if (count >= target) {
        count = target;
        clearInterval(interval);
      }
      if (type === 'influencer') {
        this.displayInfluencerCount = count;
      } else {
        this.displayCompanyCount = count;
      }
    }, 20);
  }

  pauseAnimation() {
    this.isPaused = true;
  }

  resumeAnimation() {
    this.isPaused = false;
  }
}
