import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PogrebniArtikliComponent } from './pogrebni-artikli.component';

describe('PogrebniArtikliComponent', () => {
  let component: PogrebniArtikliComponent;
  let fixture: ComponentFixture<PogrebniArtikliComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PogrebniArtikliComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PogrebniArtikliComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
