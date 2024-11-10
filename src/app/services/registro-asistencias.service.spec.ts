import { TestBed } from '@angular/core/testing';

import { RegistroAsistenciasService } from './registro-asistencias.service';

describe('RegistroAsistenciasService', () => {
  let service: RegistroAsistenciasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegistroAsistenciasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
