import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemSetting } from './system-setting';

describe('SystemSetting', () => {
  let component: SystemSetting;
  let fixture: ComponentFixture<SystemSetting>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemSetting]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemSetting);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
