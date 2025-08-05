import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeEntrepriseComponent } from './home-entreprise.component';

describe('HomeEntrepriseComponent', () => {
  let component: HomeEntrepriseComponent;
  let fixture: ComponentFixture<HomeEntrepriseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeEntrepriseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeEntrepriseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
