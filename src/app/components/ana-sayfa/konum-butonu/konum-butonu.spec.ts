import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KonumButonu } from './konum-butonu';

describe('KonumButonu', () => {
  let component: KonumButonu;
  let fixture: ComponentFixture<KonumButonu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KonumButonu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KonumButonu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
