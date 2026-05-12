import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FindBatch } from './find-batch';

describe('FindBatch', () => {
  let component: FindBatch;
  let fixture: ComponentFixture<FindBatch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FindBatch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FindBatch);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
