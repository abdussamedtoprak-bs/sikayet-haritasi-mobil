import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SorunBildirmePaneli } from './sorun-bildir-paneli';

describe('SorunBildirmePaneli', () => {
  let component: SorunBildirmePaneli;
  let fixture: ComponentFixture<SorunBildirmePaneli>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SorunBildirmePaneli]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SorunBildirmePaneli);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});