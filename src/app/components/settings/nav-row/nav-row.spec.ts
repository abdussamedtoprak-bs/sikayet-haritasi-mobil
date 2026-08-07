import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavRow } from './nav-row';

describe('NavRow', () => {
  let component: NavRow;
  let fixture: ComponentFixture<NavRow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavRow],
    }).compileComponents();

    fixture = TestBed.createComponent(NavRow);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
