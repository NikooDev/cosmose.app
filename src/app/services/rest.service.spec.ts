import { TestBed } from '@angular/core/testing';

import { RestService } from '../../../../../../Workshop/spt/src/app/services/rest.service';

describe('RestService', () => {
  let service: RestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
