import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DarkModeService {
  private isDarkMode = new BehaviorSubject<boolean>(false);
  isDarkMode$: Observable<boolean> = this.isDarkMode.asObservable();

  constructor() {
    // Initialize dark mode state from localStorage if available
    const savedMode = localStorage.getItem('darkMode');
    this.isDarkMode.next(savedMode === 'true');
    this.applyTheme(savedMode === 'true');
  }

  toggleDarkMode(): void {
    const currentMode = this.isDarkMode.value;
    this.isDarkMode.next(!currentMode);
    localStorage.setItem('darkMode', (!currentMode).toString());
    this.applyTheme(!currentMode);
  }

  private applyTheme(isDark: boolean): void {
    if (isDark) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }

  getDarkMode(): boolean {
    return this.isDarkMode.value;
  }
}