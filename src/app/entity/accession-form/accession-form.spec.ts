import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessionForm } from './accession-form';

describe('AccessionForm', () => {
  let component: AccessionForm;
  let fixture: ComponentFixture<AccessionForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessionForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessionForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
