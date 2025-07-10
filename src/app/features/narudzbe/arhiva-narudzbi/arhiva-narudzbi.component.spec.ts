import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArhivaNarudzbiComponent } from './arhiva-narudzbi.component';

describe('ArhivaNarudzbiComponent', () => {
  let component: ArhivaNarudzbiComponent;
  let fixture: ComponentFixture<ArhivaNarudzbiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ArhivaNarudzbiComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ArhivaNarudzbiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
