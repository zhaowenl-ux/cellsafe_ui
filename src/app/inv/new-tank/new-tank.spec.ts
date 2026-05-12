import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewTank } from './new-tank';

describe('NewTank', () => {
  let component: NewTank;
  let fixture: ComponentFixture<NewTank>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewTank]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewTank);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
