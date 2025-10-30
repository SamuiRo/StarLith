import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChromaticAberration } from './chromatic-aberration';

describe('ChromaticAberration', () => {
  let component: ChromaticAberration;
  let fixture: ComponentFixture<ChromaticAberration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChromaticAberration]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChromaticAberration);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
