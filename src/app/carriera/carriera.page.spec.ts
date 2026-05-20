import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CarrieraPage } from './carriera.page';

describe('CarrieraPage', () => {
  let component: CarrieraPage;
  let fixture: ComponentFixture<CarrieraPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CarrieraPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
