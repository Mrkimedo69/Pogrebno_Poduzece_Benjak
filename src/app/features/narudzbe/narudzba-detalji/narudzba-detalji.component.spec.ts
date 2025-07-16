import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NarudzbaDetaljiComponent } from './narudzba-detalji.component';

describe('NarudzbaDetaljiComponent', () => {
  let component: NarudzbaDetaljiComponent;
  let fixture: ComponentFixture<NarudzbaDetaljiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NarudzbaDetaljiComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NarudzbaDetaljiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
