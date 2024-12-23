import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroAsistenciaComponent } from './registro-asistencia.component';

describe('RegistroAsistenciaComponent', () => {
  let component: RegistroAsistenciaComponent;
  let fixture: ComponentFixture<RegistroAsistenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegistroAsistenciaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroAsistenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
