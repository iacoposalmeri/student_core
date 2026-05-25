import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HelpDeskPage } from './help-desk.page';

describe('HelpDeskPage', () => {
  let component: HelpDeskPage;
  let fixture: ComponentFixture<HelpDeskPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpDeskPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
