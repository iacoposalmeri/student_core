import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminModerazionePage } from './admin-moderazione.page';

describe('AdminModerazionePage', () => {
  let component: AdminModerazionePage;
  let fixture: ComponentFixture<AdminModerazionePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminModerazionePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
