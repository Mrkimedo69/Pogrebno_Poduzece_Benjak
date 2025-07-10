import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NarudzbeComponent } from './narudzbe.component';

describe('NarudzbeComponent', () => {
  let component: NarudzbeComponent;
  let fixture: ComponentFixture<NarudzbeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NarudzbeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NarudzbeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
