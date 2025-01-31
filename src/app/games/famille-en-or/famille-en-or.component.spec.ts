import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FamilleEnOrComponent } from './famille-en-or.component';

describe('FamilleEnOrComponent', () => {
  let component: FamilleEnOrComponent;
  let fixture: ComponentFixture<FamilleEnOrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FamilleEnOrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FamilleEnOrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
