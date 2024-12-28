import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonsFooterComponent } from './buttons-footer.component';

describe('ButtonsFooterComponent', () => {
  let component: ButtonsFooterComponent;
  let fixture: ComponentFixture<ButtonsFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonsFooterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonsFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
