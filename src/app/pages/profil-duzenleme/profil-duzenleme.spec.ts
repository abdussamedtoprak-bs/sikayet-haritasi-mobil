import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilDuzenleme } from './profil-duzenleme';

describe('ProfilDuzenleme', () => {
  let component: ProfilDuzenleme;
  let fixture: ComponentFixture<ProfilDuzenleme>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfilDuzenleme],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilDuzenleme);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
