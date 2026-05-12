import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvenanceForm } from './provenance-form';

describe('ProvenanceForm', () => {
  let component: ProvenanceForm;
  let fixture: ComponentFixture<ProvenanceForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProvenanceForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProvenanceForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
