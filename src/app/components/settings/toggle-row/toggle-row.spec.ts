import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToggleRow } from './toggle-row';

describe('ToggleRow', () => {
  let component: ToggleRow;
  let fixture: ComponentFixture<ToggleRow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToggleRow],
    }).compileComponents();

    fixture = TestBed.createComponent(ToggleRow);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
