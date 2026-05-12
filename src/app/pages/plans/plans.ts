import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-plans',
  imports: [RouterLink],
  templateUrl: './plans.html',
  styleUrl: './plans.scss',
})
export class Plans {
  protected readonly plans = [
    { title: 'Starter', tenure: '3 Months', amount: 'Rs 1,499/mo', bestFor: 'Students' },
    { title: 'Flexi', tenure: '6 Months', amount: 'Rs 2,099/mo', bestFor: 'Professionals' },
    { title: 'Comfort', tenure: '12 Months', amount: 'Rs 2,799/mo', bestFor: 'Families' },
  ];
}
