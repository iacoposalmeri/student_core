import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminDidatticaPage } from './admin-didattica.page';

describe('AdminDidatticaPage', () => {
  let component: AdminDidatticaPage;
  let fixture: ComponentFixture<AdminDidatticaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminDidatticaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
