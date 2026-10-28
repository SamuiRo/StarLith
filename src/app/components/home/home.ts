import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MainMenuButton } from '../main-menu-button/main-menu-button';
import { environment } from '../../../environments/environment';

interface MenuItem {
  label: string;
  route: string;
  download?: boolean;
  external?: boolean;
}

interface KeyboardHint {
  keys: string[];
  label: string;
}

const HINT_DURATION_MS = 20000;
// Home scrolls on purpose (the disclaimer sits below the fold), but the
// scrollbar itself shouldn't show; styled globally in styles.scss.
const HIDE_SCROLLBAR_CLASS = 'hide-scrollbar';

@Component({
  selector: 'app-home',
  imports: [CommonModule, MainMenuButton],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, OnDestroy {
  readonly cvPath = `${environment.dataPath}files/CV.pdf`;

  menuItems: MenuItem[] = [
    { label: 'About Me', route: '/aboutme' },
    { label: 'Projects', route: '/projects' },
    { label: 'Skills', route: '/skills' },
    { label: 'Studio', route: 'https://studio.starlith.net', external: true },
    { label: 'Contact', route: '/contact' },
    { label: 'Download CV', route: this.cvPath, download: true },
  ];

  readonly hintText: string = 'Navigation.';
  readonly hints: KeyboardHint[] = [
    { keys: ['W', 'S', '↑', '↓'], label: 'Select' },
    { keys: ['Enter'], label: 'Confirm' },
  ];

  selectedIndex: number = -1;
  isMobile: boolean = false;
  hintVisible: boolean = false;

  private hintTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    document.documentElement.classList.add(HIDE_SCROLLBAR_CLASS);
    this.checkIfMobile();

    if (!this.isMobile) {
      this.selectedIndex = 0;
      this.showHintTemporarily();
    }
  }

  ngOnDestroy(): void {
    document.documentElement.classList.remove(HIDE_SCROLLBAR_CLASS);
    if (this.hintTimeoutId !== null) {
      clearTimeout(this.hintTimeoutId);
    }
  }

  private showHintTemporarily(): void {
    this.hintVisible = true;
    this.hintTimeoutId = setTimeout(() => {
      this.hintVisible = false;
      this.hintTimeoutId = null;
    }, HINT_DURATION_MS);
  }

  dismissHint(): void {
    if (this.hintTimeoutId !== null) {
      clearTimeout(this.hintTimeoutId);
      this.hintTimeoutId = null;
    }
    this.hintVisible = false;
  }

  @HostListener('window:resize')
  checkIfMobile(): void {
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
      this.activateItem(this.menuItems[this.selectedIndex]);
    }
  }

  onMenuItemClick(item: MenuItem): void {
    this.activateItem(item);
  }

  private activateItem(item: MenuItem): void {
    if (item.download) {
      this.downloadFile(item.route);
    } else if (item.external) {
      window.open(item.route, '_blank', 'noopener');
    } else {
      this.router.navigate([item.route]);
    }
  }

  private downloadFile(href: string): void {
    const link = document.createElement('a');
    link.href = href;
    link.download = 'CV.pdf';
    link.click();
  }

  isSelected(index: number): boolean {
    return !this.isMobile && this.selectedIndex === index;
  }
}
