import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FindCell } from './find-cell';

describe('FindCell', () => {
  let component: FindCell;
  let fixture: ComponentFixture<FindCell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FindCell]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FindCell);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
