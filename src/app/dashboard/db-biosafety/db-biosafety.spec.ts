import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DbBiosafety } from './db-biosafety';

describe('DbBiosafety', () => {
  let component: DbBiosafety;
  let fixture: ComponentFixture<DbBiosafety>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DbBiosafety]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DbBiosafety);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
