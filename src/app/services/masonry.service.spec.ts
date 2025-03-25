import { TestBed } from '@angular/core/testing';

import { MasonryService } from './masonry.service';

describe('MasonryService', () => {
  let service: MasonryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MasonryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
