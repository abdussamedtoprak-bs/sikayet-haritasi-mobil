import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabFilter } from './tab-filter';

describe('TabFilter', () => {
  let component: TabFilter;
  let fixture: ComponentFixture<TabFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabFilter],
    }).compileComponents();

    fixture = TestBed.createComponent(TabFilter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
