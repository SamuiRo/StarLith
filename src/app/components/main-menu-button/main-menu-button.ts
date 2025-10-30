import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import anime from 'animejs/lib/anime.es.js';

interface ButtonConfig {
  showParticles?: boolean;
  showOrnamentalLine?: boolean;
  particleCount?: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
}

@Component({
  selector: 'app-main-menu-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main-menu-button.html',
  styleUrl: './main-menu-button.scss',
  host: {
    '[class.active]': 'isActive',
  },
})
export class MainMenuButton implements AfterViewInit, OnDestroy, OnChanges {
  @Input() isActive = false;
  @Input() config: ButtonConfig = {
    showParticles: true,
    showOrnamentalLine: true,
    particleCount: 10,
  };

  @Output() buttonClick = new EventEmitter<void>();

  @ViewChild('ornamentalLine') private ornamentalLine?: ElementRef<HTMLElement>;
  @ViewChild('particlesContainer') private particlesContainer?: ElementRef<HTMLElement>;

  particles: Particle[] = [];

  private readonly ANIMATION_CONFIG = {
    LINE_WIDTH: 80,
    CONTAINER_FADE_DURATION: 200,
    LINE_EXPAND_DURATION: 400,
    DOT_APPEAR_DURATION: 300,
    DOT_APPEAR_DELAY: 200,
    CENTER_LINE_DURATION: 400,
    CENTER_LINE_DELAY: 100,
    DEACTIVATION_DURATION: 300,
  } as const;

  private currentAnimation?: anime.AnimeInstance;
  private particleAnimations: anime.AnimeInstance[] = [];
  private isHovered = false;

  ngAfterViewInit(): void {
    this.initializeParticles();

    if (this.isActive) {
      requestAnimationFrame(() => {
        setTimeout(() => this.playActivationAnimation(), 150);
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isActive'] && !changes['isActive'].firstChange) {
      const isNowActive = changes['isActive'].currentValue;

      if (!this.isHovered) {
        isNowActive ? this.playActivationAnimation() : this.playDeactivationAnimation();
      }
    }
  }

  ngOnDestroy(): void {
    this.stopAllAnimations();
  }

  onClick(): void {
    this.buttonClick.emit();
  }

  onHover(): void {
    this.isHovered = true;
    if (!this.isActive) {
      this.isActive = true;
      this.playActivationAnimation();
    }
  }

  onLeave(): void {
    this.isHovered = false;
    if (this.isActive) {
      this.isActive = false;
      this.playDeactivationAnimation();
    }
  }

  private initializeParticles(): void {
    if (!this.config.showParticles) return;

    const count = this.config.particleCount ?? 10;
    this.particles = Array.from({ length: count }, (_, id) => ({
      id,
      x: Math.random() * 100,
      y: Math.random() * 100,
    }));
  }

  private playActivationAnimation(): void {
    this.stopAllAnimations();

    if (!this.config.showOrnamentalLine || !this.ornamentalLine) {
      if (this.config.showParticles) {
        this.animateParticles();
      }
      return;
    }

    const lineEl = this.ornamentalLine.nativeElement;
    const { 
      CONTAINER_FADE_DURATION, 
      LINE_EXPAND_DURATION, 
      LINE_WIDTH,
      DOT_APPEAR_DURATION,
      DOT_APPEAR_DELAY,
      CENTER_LINE_DURATION,
      CENTER_LINE_DELAY
    } = this.ANIMATION_CONFIG;

    // Create timeline for synchronized animations
    const timeline = anime.timeline({
      easing: 'easeOutQuad',
    });

    // Step 1: Fade in container
    timeline.add({
      targets: lineEl,
      opacity: [0, 1],
      duration: CONTAINER_FADE_DURATION,
    });

    //TODO Step 2: Expand left and right lines simultaneously
    timeline.add({
      targets: [
        lineEl.querySelector('.line-segment.left'),
        lineEl.querySelector('.line-segment.right'),
      ],
      width: [0, LINE_WIDTH],
      duration: LINE_EXPAND_DURATION,
      easing: 'easeOutExpo',
    }, `-=${CONTAINER_FADE_DURATION * 0.5}`);

    // Step 3: Fade in center line
    timeline.add({
      targets: lineEl.querySelector('.line-segment.center'),
      opacity: [0, 0.6],
      duration: CENTER_LINE_DURATION,
    }, `-=${LINE_EXPAND_DURATION - CENTER_LINE_DELAY}`);

    //TODO Step 4: Appear dots
    timeline.add({
      targets: lineEl.querySelectorAll('.dot'),
      opacity: [0, 1],
      scale: [0, 1],
      duration: DOT_APPEAR_DURATION,
      easing: 'easeOutBack',
    }, `-=${LINE_EXPAND_DURATION - DOT_APPEAR_DELAY}`);

    this.currentAnimation = timeline;

    // Animate particles
    if (this.config.showParticles) {
      this.animateParticles();
    }
  }

  private animateParticles(): void {
    if (!this.particlesContainer) return;

    const container = this.particlesContainer.nativeElement;

    this.particles.forEach((_, index) => {
      const particleEl = container.querySelector(`[data-index="${index}"]`) as HTMLElement;
      if (!particleEl) return;

      const delay = Math.random() * 500;
      const duration = 1000 + Math.random() * 1000;

      const startX = Math.random() * 100;
      const startY = 50 + (Math.random() - 0.5) * 20;
      const endX = startX + (Math.random() - 0.5) * 40;
      const endY = startY + (Math.random() - 0.5) * 30;

      particleEl.style.left = `${startX}%`;
      particleEl.style.top = `${startY}%`;

      const animation = anime({
        targets: particleEl,
        left: [`${startX}%`, `${endX}%`],
        top: [`${startY}%`, `${endY}%`],
        opacity: [
          { value: 0, duration: 0 },
          { value: 1, duration: duration * 0.2 },
          { value: 1, duration: duration * 0.6 },
          { value: 0, duration: duration * 0.2 },
        ],
        scale: [
          { value: 0, duration: 0 },
          { value: 1.5, duration: duration * 0.3 },
          { value: 1, duration: duration * 0.7 },
        ],
        duration,
        delay,
        easing: 'easeInOutQuad',
        loop: true,
      });

      this.particleAnimations.push(animation);
    });
  }

  private playDeactivationAnimation(): void {
    const { DEACTIVATION_DURATION } = this.ANIMATION_CONFIG;

    // Animate particles fade out
    if (this.config.showParticles && this.particlesContainer) {
      const particleElements = this.particlesContainer.nativeElement.querySelectorAll('.particle');

      anime({
        targets: particleElements,
        opacity: 0,
        scale: 0,
        duration: DEACTIVATION_DURATION,
        easing: 'easeOutQuad',
        complete: () => this.stopAllAnimations(),
      });
    } else {
      this.stopAllAnimations();
    }

    // Animate lines fade out
    if (this.config.showOrnamentalLine && this.ornamentalLine) {
      const lineEl = this.ornamentalLine.nativeElement;

      const timeline = anime.timeline({
        duration: DEACTIVATION_DURATION,
      });

      timeline
        .add({
          targets: lineEl,
          opacity: [1, 0],
          easing: 'easeOutQuad',
        })
        .add({
          targets: [
            lineEl.querySelector('.line-segment.left'),
            lineEl.querySelector('.line-segment.right'),
          ],
          width: [this.ANIMATION_CONFIG.LINE_WIDTH, 0],
          easing: 'easeInExpo',
        }, 0)
        .add({
          targets: lineEl.querySelectorAll('.dot'),
          opacity: [1, 0],
          scale: [1, 0],
          duration: 200,
          easing: 'easeInBack',
        }, 0);
    }
  }

  private stopAllAnimations(): void {
    this.currentAnimation?.pause();
    this.particleAnimations.forEach(anim => anim?.pause());
    this.particleAnimations = [];
    this.currentAnimation = undefined;
  }
}