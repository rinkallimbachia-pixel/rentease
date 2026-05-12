import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-how-it-works',
  imports: [RouterLink],
  templateUrl: './how-it-works.html',
  styleUrl: './how-it-works.scss',
})
export class HowItWorks {
  protected readonly steps = [
    'Browse furniture and appliances from our verified catalog.',
    'Choose monthly rental tenure with transparent pricing.',
    'Schedule delivery at your preferred address and date.',
    'Extend, maintain, or return directly from your dashboard.',
  ];
}
