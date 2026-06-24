import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminCampusPage } from './admin-campus.page';

describe('AdminCampusPage', () => {
  let component: AdminCampusPage;
  let fixture: ComponentFixture<AdminCampusPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminCampusPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
