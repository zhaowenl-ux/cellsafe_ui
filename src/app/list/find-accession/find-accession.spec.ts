import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FindAccession } from './find-accession';

describe('FindAccession', () => {
  let component: FindAccession;
  let fixture: ComponentFixture<FindAccession>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FindAccession]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FindAccession);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
