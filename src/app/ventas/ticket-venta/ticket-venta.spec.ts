import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TicketVenta } from './ticket-venta';

describe('TicketVenta', () => {
  let component: TicketVenta;
  let fixture: ComponentFixture<TicketVenta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketVenta],
    }).compileComponents();

    fixture = TestBed.createComponent(TicketVenta);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
