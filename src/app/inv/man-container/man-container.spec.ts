import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManContainer } from './man-container';

describe('ManContainer', () => {
  let component: ManContainer;
  let fixture: ComponentFixture<ManContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManContainer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManContainer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
