import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScanLineEffect } from './scan-line-effect';

describe('ScanLineEffect', () => {
  let component: ScanLineEffect;
  let fixture: ComponentFixture<ScanLineEffect>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScanLineEffect]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScanLineEffect);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
