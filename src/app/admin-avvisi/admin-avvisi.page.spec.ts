import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminAvvisiPage } from './admin-avvisi.page';

describe('AdminAvvisiPage', () => {
  let component: AdminAvvisiPage;
  let fixture: ComponentFixture<AdminAvvisiPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminAvvisiPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
