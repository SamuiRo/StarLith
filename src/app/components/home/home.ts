import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MainMenuButton } from '../main-menu-button/main-menu-button';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule, MainMenuButton],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  menuItems = [
    { label: 'About Me', route: '/aboutme' },
    { label: 'Projects', route: '/projects' },
    { label: 'Skills', route: '/skills' },
    { label: 'Contact', route: '/contact' },
  ];

  selectedIndex: number = -1;
  isMobile: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.checkIfMobile();

    if (!this.isMobile) {
      this.selectedIndex = 0;
    }

    window.addEventListener('resize', () => this.checkIfMobile());
  }

  private checkIfMobile(): void {
    const wasMobile = this.isMobile;
    this.isMobile =
      window.innerWidth <= 768 ||
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0;

    if (wasMobile !== this.isMobile) {
      this.selectedIndex = this.isMobile ? -1 : 0;
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (this.isMobile) {
      return;
    }

    const code = event.code;
    switch (code) {
      case 'KeyW':
      case 'ArrowUp':
        event.preventDefault();
        this.navigateUp();
        break;

      case 'KeyS':
      case 'ArrowDown':
        event.preventDefault();
        this.navigateDown();
        break;

      case 'Enter':
      case 'NumpadEnter':
        event.preventDefault();
        this.confirmSelection();
        break;
    }
  }

  private navigateUp(): void {
    if (this.selectedIndex > 0) {
      this.selectedIndex--;
    }
  }

  private navigateDown(): void {
    if (this.selectedIndex < this.menuItems.length - 1) {
      this.selectedIndex++;
    }
  }

  private confirmSelection(): void {
    if (this.selectedIndex >= 0) {
      this.navigateTo(this.menuItems[this.selectedIndex].route);
    }
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  isSelected(index: number): boolean {
    return !this.isMobile && this.selectedIndex === index;
  }
}
