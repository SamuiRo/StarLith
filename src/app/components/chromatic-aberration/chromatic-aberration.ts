import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import anime from 'animejs/lib/anime.es.js';

type IntensityLevel = 'subtle' | 'normal' | 'intense' | 'extreme';

interface Offset {
  x: number;
  y: number;
}

interface IntensityConfig {
  offsetX: number;
  offsetY: number;
  scale: number;
}

@Component({
  selector: 'app-chromatic-aberration',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chromatic-aberration.html',
  styleUrl: './chromatic-aberration.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChromaticAberration implements OnInit, OnDestroy {
  @Input() intensity: IntensityLevel = 'intense';
  @Input() animated = true;
  @Input() mouseInteractive = false;

  readonly filterId = `chromatic-filter-${Math.random().toString(36).slice(2, 11)}`;

  redOffset: Offset = { x: -5, y: -2 };
  blueOffset: Offset = { x: 5, y: 2 };
  redScale = 12;
  blueScale = 12;

  private animation: ReturnType<typeof anime> | null = null;

  private readonly INTENSITY_CONFIG: Record<IntensityLevel, IntensityConfig> = {
    subtle: { offsetX: 2, offsetY: 1, scale: 6 },
    normal: { offsetX: 3, offsetY: 1.5, scale: 9 },
    intense: { offsetX: 5, offsetY: 2, scale: 12 },
    extreme: { offsetX: 8, offsetY: 3, scale: 18 },
  };

  ngOnInit(): void {
    this.applyIntensity(this.intensity);

    if (this.animated) {
      this.initBreathingAnimation();
    }
  }

  ngOnDestroy(): void {
    this.stopAnimation();
  }

  /**
   * Applies chromatic aberration intensity settings
   */
  private applyIntensity(level: IntensityLevel): void {
    const { offsetX, offsetY, scale } = this.INTENSITY_CONFIG[level];

    this.redOffset = { x: -offsetX, y: -offsetY };
    this.blueOffset = { x: offsetX, y: offsetY };
    this.redScale = scale;
    this.blueScale = scale;
  }

  /**
   * TODO
   * Initializes smooth breathing animation effect
   */
  private initBreathingAnimation(): void {
    const baseScale = this.redScale;

    this.animation = anime({
      targets: this,
      redScale: [baseScale, baseScale * 1.3],
      blueScale: [baseScale, baseScale * 1.3],
      duration: 4000,
      easing: 'easeInOutSine',
      direction: 'alternate',
      loop: true,
    });
  }

  /**TODO
   * Updates the aberration intensity level
   */
  public setIntensity(level: IntensityLevel): void {
    this.intensity = level;
    this.applyIntensity(level);
  }

  private stopAnimation(): void {
    if (this.animation) {
      this.animation.pause();
      this.animation = null;
    }
  }
}