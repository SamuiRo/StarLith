import { Component, OnDestroy, OnInit } from '@angular/core';
import anime from 'animejs/lib/anime.es.js';

interface ScanLine {
  id: number;
  top: number;
  height: number;
  width: number;
  opacity: number;
}

@Component({
  selector: 'app-scan-line-effect',
  imports: [],
  templateUrl: './scan-line-effect.html',
  styleUrl: './scan-line-effect.scss',
})
export class ScanLineEffect implements OnInit, OnDestroy{
  lines: ScanLine[] = [];
  private animation: any;
  private lineCount = 15;

  ngOnInit() {
    this.generateLines();
    this.startAnimation();
  }

  ngOnDestroy() {
    if (this.animation) {
      this.animation.pause();
    }
  }

  generateLines() {
    this.lines = Array.from({ length: this.lineCount }, (_, i) => ({
      id: i,
      top: Math.random() * 100,
      height: Math.random() * 3 + 1,
      width: Math.random() * 100,
      opacity: 0
    }));
  }

  startAnimation() {
    this.animation = anime({
      targets: this.lines,
      opacity: [
        { value: 0.8, duration: 300 },
        { value: 0, duration: 500 }
      ],
      easing: 'easeInOutSine',
      loop: true,
      delay: (el, i) => Math.random() * 2000,
      update: () => {
        this.lines.forEach(line => {
          line.top = Math.random() * 100;
          line.width = Math.random() * 80 + 20;
        });
      }
    });
  }

  getLineStyle(line: ScanLine) {
    return {
      'top': `${line.top}%`,
      'height': `${line.height}px`,
      'width': `${line.width}%`,
      'opacity': line.opacity
    };
  }
}
