import { TestBed } from '@angular/core/testing';

import { Bildirimler } from './bildirimler';

describe('Bildirimler', () => {
  let service: Bildirimler;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Bildirimler);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
