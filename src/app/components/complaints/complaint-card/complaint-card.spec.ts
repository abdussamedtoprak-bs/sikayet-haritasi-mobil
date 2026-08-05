import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplaintCard } from './complaint-card';

describe('ComplaintCard', () => {
  let component: ComplaintCard;
  let fixture: ComponentFixture<ComplaintCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComplaintCard],
    }).compileComponents();

    fixture = TestBed.createComponent(ComplaintCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
