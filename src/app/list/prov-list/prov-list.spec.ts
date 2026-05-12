import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvList } from './prov-list';

describe('ProvList', () => {
  let component: ProvList;
  let fixture: ComponentFixture<ProvList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProvList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProvList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
