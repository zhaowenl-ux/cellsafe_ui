import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VialForm } from './vial-form';

describe('VialForm', () => {
  let component: VialForm;
  let fixture: ComponentFixture<VialForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VialForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VialForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
