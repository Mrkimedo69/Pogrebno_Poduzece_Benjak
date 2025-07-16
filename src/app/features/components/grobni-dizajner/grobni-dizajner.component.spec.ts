import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GrobniDizajnerComponent } from './grobni-dizajner.component';

describe('GrobniDizajnerComponent', () => {
  let component: GrobniDizajnerComponent;
  let fixture: ComponentFixture<GrobniDizajnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GrobniDizajnerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GrobniDizajnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
