import { TestBed } from '@angular/core/testing';

import { ScanLine } from '../../scan-line';

describe('ScanLine', () => {
  let service: ScanLine;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScanLine);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
