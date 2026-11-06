import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionGroupComponent } from './transaction-group.component';

describe('TransactionGroupComponent', () => {
  let component: TransactionGroupComponent;
  let fixture: ComponentFixture<TransactionGroupComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
