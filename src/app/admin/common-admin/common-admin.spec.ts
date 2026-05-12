import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonAdmin } from './common-admin';

describe('CommonAdmin', () => {
  let component: CommonAdmin;
  let fixture: ComponentFixture<CommonAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommonAdmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
