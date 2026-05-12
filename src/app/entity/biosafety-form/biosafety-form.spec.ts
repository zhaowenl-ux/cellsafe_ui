import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BiosafetyForm } from './biosafety-form';

describe('BiosafetyForm', () => {
  let component: BiosafetyForm;
  let fixture: ComponentFixture<BiosafetyForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BiosafetyForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BiosafetyForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
