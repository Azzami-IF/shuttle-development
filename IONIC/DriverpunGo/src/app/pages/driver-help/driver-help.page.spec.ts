import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DriverHelpPage } from './driver-help.page';

describe('DriverHelpPage', () => {
  let component: DriverHelpPage;
  let fixture: ComponentFixture<DriverHelpPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DriverHelpPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
