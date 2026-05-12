import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupAdmin } from './group-admin';

describe('GroupAdmin', () => {
  let component: GroupAdmin;
  let fixture: ComponentFixture<GroupAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupAdmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
