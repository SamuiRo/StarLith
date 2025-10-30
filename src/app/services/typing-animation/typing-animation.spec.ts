import { TestBed } from '@angular/core/testing';

import { TypingAnimation } from '../../typing-animation';

describe('TypingAnimation', () => {
  let service: TypingAnimation;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TypingAnimation);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
