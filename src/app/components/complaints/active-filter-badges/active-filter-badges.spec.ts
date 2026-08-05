import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveFilterBadges } from './active-filter-badges';

describe('ActiveFilterBadges', () => {
  let component: ActiveFilterBadges;
  let fixture: ComponentFixture<ActiveFilterBadges>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveFilterBadges],
    }).compileComponents();

    fixture = TestBed.createComponent(ActiveFilterBadges);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
