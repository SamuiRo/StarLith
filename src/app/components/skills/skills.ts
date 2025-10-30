import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import { forkJoin, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

interface MenuItem {
  id: string;
  title: string;
  content: string;
  icon?: string;
}

interface MenuConfig {
  id: string;
  title: string;
  contentFile: string;
}

export interface KeyboardHint {
  keys: string[];
  label: string;
}

const enum KeyCode {
  UP_W = 'KeyW',
  UP_ARROW = 'ArrowUp',
  DOWN_S = 'KeyS',
  DOWN_ARROW = 'ArrowDown',
  ENTER = 'Enter',
  ENTER_NUMPAD = 'NumpadEnter',
  ESCAPE = 'Escape',
}

@Component({
  selector: 'app-skills',
  imports: [CommonModule, MarkdownModule],
  templateUrl: './skills.html',
  styleUrl: './skills.scss',
})
export class Skills implements OnInit {
 @Input() text: string = 'Navigation.';
   @Input() hints: KeyboardHint[] = [
     { keys: ['W', 'S', '↑', '↓'], label: 'Select' },
     { keys: ['Enter'], label: 'Confirm' },
     { keys: ['Esc'], label: 'Back' },
   ];
 
   menuSections: MenuItem[] = [];
   selectedItem: MenuItem | null = null;
   private currentIndex: number = 0;
 
   constructor(private router: Router, private http: HttpClient) {}
 
   async ngOnInit(): Promise<void> {
     await this.loadMenuSections();
     if (this.menuSections.length > 0) {
       this.selectItem(this.menuSections[0]);
     }
   }
 
   private async loadMenuSections(): Promise<void> {
     try {
       await this.loadFromMarkdown();
     } catch (error) {
       console.error('Error loading menu sections:', error);
       console.warn('Loading fallback data...');
       this.loadFallbackData();
     }
   }
 
   private async loadFromMarkdown(): Promise<void> {
     const config = await firstValueFrom(
       this.http.get<MenuConfig[]>(`${environment.dataPath}data/skills.config.json`)
     );
 
     const requests = config.map((item) => {
       const path = `${environment.dataPath}content/skills/${item.contentFile}`;
       return this.http.get(path, { responseType: 'text' });
     });
 
     const contents = await firstValueFrom(forkJoin(requests));
 
     this.menuSections = config.map((item, index) => ({
       id: item.id,
       title: item.title,
       content: contents[index],
     }));
   }
 
   private loadFallbackData(): void {
     this.menuSections = [
       {
         id: 'profile',
         title: 'Profile',
         content: `# No Data`,
       },
       {
         id: 'story',
         title: 'Story',
         content: `# No Data`,
       },
       {
         id: 'qualities',
         title: 'Qualities',
         content: `# No Data`,
       },
       {
         id: 'skills',
         title: 'Tech',
         content: `# No Data`,
       },
     ];
   }
 
   @HostListener('window:keydown', ['$event'])
   handleKeyboardEvent(event: KeyboardEvent): void {
     const { code } = event;
 
     switch (code) {
       case KeyCode.UP_W:
       case KeyCode.UP_ARROW:
         event.preventDefault();
         this.navigateUp();
         break;
 
       case KeyCode.DOWN_S:
       case KeyCode.DOWN_ARROW:
         event.preventDefault();
         this.navigateDown();
         break;
 
       case KeyCode.ENTER:
       case KeyCode.ENTER_NUMPAD:
         event.preventDefault();
         break;
 
       case KeyCode.ESCAPE:
         event.preventDefault();
         this.goBack();
         break;
     }
   }
 
   selectItem(item: MenuItem): void {
     this.selectedItem = item;
     this.currentIndex = this.menuSections.findIndex((s) => s.id === item.id);
   }
 
   private navigateUp(): void {
     if (this.currentIndex > 0) {
       this.currentIndex--;
       this.selectItem(this.menuSections[this.currentIndex]);
     }
   }
 
   private navigateDown(): void {
     if (this.currentIndex < this.menuSections.length - 1) {
       this.currentIndex++;
       this.selectItem(this.menuSections[this.currentIndex]);
     }
   }
 
   private goBack(): void {
     this.router.navigate(['/home']);
   }
}
