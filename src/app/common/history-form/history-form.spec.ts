import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryForm } from './history-form';

describe('HistoryForm', () => {
  let component: HistoryForm;
  let fixture: ComponentFixture<HistoryForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoryForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
