import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountGroupComponent } from './account-group.component';

describe('AccountGroupComponent', () => {
  let component: AccountGroupComponent;
  let fixture: ComponentFixture<AccountGroupComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
