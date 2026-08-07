import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Destek } from './destek';

describe('Destek', () => {
  let component: Destek;
  let fixture: ComponentFixture<Destek>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Destek],
    }).compileComponents();

    fixture = TestBed.createComponent(Destek);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
