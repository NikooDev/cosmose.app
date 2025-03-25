import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { ipGuard } from './ip.guard';

describe('ipGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => ipGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
