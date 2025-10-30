import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TypingAnimation } from '../../services/typing-animation/typing-animation';
import { ScanLineEffect } from '../scan-line-effect/scan-line-effect';
import { ChromaticAberration } from '../chromatic-aberration/chromatic-aberration';

@Component({
  selector: 'app-loading',
  imports: [RouterModule, CommonModule, ScanLineEffect, ChromaticAberration],
  standalone: true,
  templateUrl: './loading.html',
  styleUrl: './loading.scss',
})
export class Loading implements AfterViewInit {
  @ViewChild('consoleOutput') consoleOutput!: ElementRef;

  constructor(
    private router: Router,
    private typingAnimation: TypingAnimation
  ) {}

  systems = [
    { text: 'Commencing Core Diagnostics', delay: 0 },
    { text: 'Neural Interface: Online', delay: 100 },
    { text: 'Memory Fragment Check: Complete', delay: 100 },
    { text: 'Cognitive Kernel Status: Stable', delay: 100 },
    { text: 'Emotional Matrix: Desynchronized', delay: 100 },
    { text: 'Reconstructing Personality Profile...', delay: 100 },
    { text: 'Synchronizing Light Protocols...', delay: 100 },
    { text: 'Calibrating Optic Sensors', delay: 100 },
    { text: 'Initiating Pod Link', delay: 100 },
    { text: 'Activating Synthetic Soul', delay: 100 },
    { text: 'Launching StarLith Environment', delay: 100 },
    { text: 'Establishing Human Connection...', delay: 100 },
    { text: 'Awaiting Consciousness Signal...', delay: 100 },
  ];

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.startLoadingSequence();
    }, 100);
  }

  async startLoadingSequence(): Promise<void> {
    if (!this.consoleOutput?.nativeElement) return;
    await this.typingAnimation.createSequenceAnimation(
      this.consoleOutput.nativeElement,
      this.systems,
      {
        duration: 200,
        cursorChar: '▋',
        cursorBlinkSpeed: 500,
      }
    );

    await this.delay(500);

    this.router.navigate(['/home']);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
