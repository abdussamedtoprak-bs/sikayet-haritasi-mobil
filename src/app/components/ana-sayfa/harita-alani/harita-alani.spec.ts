import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HaritaAlani } from './harita-alani';

describe('HaritaAlani', () => {
  let component: HaritaAlani;
  let fixture: ComponentFixture<HaritaAlani>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HaritaAlani]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HaritaAlani);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
