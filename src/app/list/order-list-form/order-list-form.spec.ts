import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderListForm } from './order-list-form';

describe('OrderListForm', () => {
  let component: OrderListForm;
  let fixture: ComponentFixture<OrderListForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderListForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderListForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
