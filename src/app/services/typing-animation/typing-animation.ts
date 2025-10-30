import { Injectable } from '@angular/core';
import anime from 'animejs/lib/anime.es.js';

export interface TypingOptions {
  duration?: number;
  delay?: number;
  cursorChar?: string;
  cursorBlinkSpeed?: number;
  eraseOnComplete?: boolean;
  onComplete?: () => void;
  onStart?: () => void;
}

export interface TypingAnimationInstance {
  typing: anime.AnimeInstance;
  cursor: anime.AnimeInstance;
  pause: () => void;
  play: () => void;
  restart: () => void;
}

@Injectable({
  providedIn: 'root',
})
export class TypingAnimation {
  createTypingAnimation(
    targetElement: HTMLElement,
    text: string,
    options: TypingOptions = {}
  ): TypingAnimationInstance {
    const config: TypingOptions = {
      duration: 1000,
      delay: 0,
      cursorChar: '▋',
      cursorBlinkSpeed: 600,
      eraseOnComplete: false,
      onComplete: () => {},
      onStart: () => {},
      ...options,
    };

    targetElement.innerHTML = '';

    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    cursor.textContent = config.cursorChar ?? '▋';
    cursor.style.display = 'inline-block';

    targetElement.appendChild(cursor);

    const cursorAnimation = anime({
      targets: cursor,
      opacity: [1, 0],
      duration: config.cursorBlinkSpeed,
      loop: true,
      easing: 'easeInOutSine',
    });

    if (typeof config.onStart === 'function') {
      config.onStart();
    }

    const typingAnimation = anime({
      targets: { value: 0 },
      value: [0, text.length],
      duration: config.duration,
      delay: config.delay,
      easing: 'linear',
      update: function (anim) {
        const currentLength = Math.floor(+anim.animations[0].currentValue);
        const currentText = text.substring(0, currentLength);

        targetElement.innerHTML = currentText;
        targetElement.appendChild(cursor);
      },
      complete: () => {
        cursorAnimation.pause();
        cursor.style.visibility = 'hidden';
        if (config.eraseOnComplete) {
          setTimeout(() => {
            this.eraseTyping(targetElement, text, config);
          }, 1000);
        }
        if (typeof config.onComplete === 'function') {
          config.onComplete();
        }
      },
    });

    return {
      typing: typingAnimation,
      cursor: cursorAnimation,
      pause: () => {
        typingAnimation.pause();
        cursorAnimation.pause();
      },
      play: () => {
        typingAnimation.play();
        cursorAnimation.play();
      },
      restart: () => {
        typingAnimation.restart();
        cursorAnimation.restart();
        cursor.style.display = 'inline-block';
      },
    };
  }

  async createSequenceAnimation(
    targetElement: HTMLElement,
    messages: Array<{ text: string; delay?: number }>,
    options: TypingOptions = {}
  ): Promise<void> {
    try {
      targetElement.innerHTML = '';

      for (const [index, message] of messages.entries()) {
        const messageElement = document.createElement('div');

        messageElement.className = 'console-line glitch';
        targetElement.appendChild(messageElement);

        if (message.delay) {
          await this.delay(message.delay);
        }

        await new Promise<void>((resolve) => {
          this.createTypingAnimation(messageElement, message.text, {
            ...options,
            onComplete: () => {
              resolve();
            },
          });
        });

        if (!message.delay && index < messages.length - 1) {
          await this.delay(300);
        }
      }
    } catch (error) {
      console.log('Animation error:', error);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private eraseTyping(
    targetElement: HTMLElement,
    text: string,
    config: TypingOptions
  ) {
    const cursor = targetElement.querySelector('.typing-cursor') as HTMLElement;
    if (cursor) {
      cursor.style.display = 'none';
    }
    anime({
      targets: { value: text.length },
      value: [text.length, 0],
      duration: (config.duration ?? 1000) / 2,
      easing: 'linear',
      update: function (anim) {
        const currentLength = Math.floor(+anim.animations[0].currentValue);
        const currentText = text.substring(0, currentLength);

        const cursor = targetElement.querySelector('.typing-cursor');
        targetElement.innerHTML = currentText;
        if (cursor) targetElement.appendChild(cursor);
      },
    });
  }
}
