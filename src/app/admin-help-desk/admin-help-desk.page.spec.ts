import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminHelpDeskPage } from './admin-help-desk.page';

describe('AdminHelpDeskPage', () => {
  let component: AdminHelpDeskPage;
  let fixture: ComponentFixture<AdminHelpDeskPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminHelpDeskPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
