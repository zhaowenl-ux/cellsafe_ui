import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManBox } from './man-box';

describe('ManBox', () => {
  let component: ManBox;
  let fixture: ComponentFixture<ManBox>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManBox]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManBox);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
