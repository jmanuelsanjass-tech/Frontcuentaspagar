import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  template: '<router-outlet />',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('cuentaspagar');
}
