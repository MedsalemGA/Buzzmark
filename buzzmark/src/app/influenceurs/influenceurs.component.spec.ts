import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfluenceursComponent } from './influenceurs.component';

describe('InfluenceursComponent', () => {
  let component: InfluenceursComponent;
  let fixture: ComponentFixture<InfluenceursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfluenceursComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfluenceursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
