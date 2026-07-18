import { Directive, ElementRef, HostBinding, AfterViewInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appMarqueeText]',
})
export class MarqueeText implements AfterViewInit, OnDestroy {
  @HostBinding('class.marquee-overflowing') isOverflowing = false;

  private resizeObserver?: ResizeObserver;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    this.checkOverflow();
    this.resizeObserver = new ResizeObserver(() => this.checkOverflow());
    this.resizeObserver.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  private checkOverflow(): void {
    const el = this.el.nativeElement;
    const distance = el.scrollWidth - el.clientWidth;
    this.isOverflowing = distance > 1;
    el.style.setProperty('--marquee-distance', `${Math.max(distance, 0)}px`);
  }
}
