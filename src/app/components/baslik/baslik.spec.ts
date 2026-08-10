import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Baslik } from './baslik';

describe('Baslik', () => {
  let component: Baslik;
  let fixture: ComponentFixture<Baslik>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Baslik]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Baslik);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
