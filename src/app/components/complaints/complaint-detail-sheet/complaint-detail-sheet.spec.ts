import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplaintDetailSheet } from './complaint-detail-sheet';

describe('ComplaintDetailSheet', () => {
  let component: ComplaintDetailSheet;
  let fixture: ComponentFixture<ComplaintDetailSheet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComplaintDetailSheet],
    }).compileComponents();

    fixture = TestBed.createComponent(ComplaintDetailSheet);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
