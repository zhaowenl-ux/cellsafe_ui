import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogUser } from './dialog-user';

describe('DialogUser', () => {
  let component: DialogUser;
  let fixture: ComponentFixture<DialogUser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogUser]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogUser);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
