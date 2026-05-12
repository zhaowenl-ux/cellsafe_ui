import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleAdmin } from './role-admin';

describe('RoleAdmin', () => {
  let component: RoleAdmin;
  let fixture: ComponentFixture<RoleAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoleAdmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
