import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorForm } from './error-form';

describe('ErrorForm', () => {
  let component: ErrorForm;
  let fixture: ComponentFixture<ErrorForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ErrorForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
