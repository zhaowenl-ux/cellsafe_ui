import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayField } from './display-field';

describe('DisplayField', () => {
  let component: DisplayField;
  let fixture: ComponentFixture<DisplayField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisplayField]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisplayField);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
