import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CellForm } from './cell-form';

describe('CellForm', () => {
  let component: CellForm;
  let fixture: ComponentFixture<CellForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CellForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CellForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
