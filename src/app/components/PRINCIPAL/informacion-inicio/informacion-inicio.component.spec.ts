import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InformacionInicioComponent } from './informacion-inicio.component';

describe('InformacionInicioComponent', () => {
  let component: InformacionInicioComponent;
  let fixture: ComponentFixture<InformacionInicioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InformacionInicioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InformacionInicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
