import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogCell } from './dialog-cell';

describe('DialogCell', () => {
  let component: DialogCell;
  let fixture: ComponentFixture<DialogCell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogCell]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogCell);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
