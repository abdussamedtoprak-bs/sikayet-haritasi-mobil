import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YanMenu } from './yan-menu';

describe('YanMenu', () => {
  let component: YanMenu;
  let fixture: ComponentFixture<YanMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YanMenu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YanMenu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
