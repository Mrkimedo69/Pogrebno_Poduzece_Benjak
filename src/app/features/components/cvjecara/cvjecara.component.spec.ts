import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CvjecaraComponent } from './cvjecara.component';

describe('CvjecaraComponent', () => {
  let component: CvjecaraComponent;
  let fixture: ComponentFixture<CvjecaraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CvjecaraComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CvjecaraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
