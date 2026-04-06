import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Treasures } from './treasures';

describe('Treasures', () => {
  let component: Treasures;
  let fixture: ComponentFixture<Treasures>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Treasures],
    }).compileComponents();

    fixture = TestBed.createComponent(Treasures);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
