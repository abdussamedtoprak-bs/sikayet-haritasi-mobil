import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriorityLegend } from './priority-legend';

describe('PriorityLegend', () => {
  let component: PriorityLegend;
  let fixture: ComponentFixture<PriorityLegend>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriorityLegend],
    }).compileComponents();

    fixture = TestBed.createComponent(PriorityLegend);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
