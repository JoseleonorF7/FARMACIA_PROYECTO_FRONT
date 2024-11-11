import { TestBed } from '@angular/core/testing';

import { InformacionInicioService } from './informacion-inicio.service';

describe('InformacionInicioService', () => {
  let service: InformacionInicioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InformacionInicioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
