import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-catalog',
  imports: [RouterLink],
  templateUrl: './catalog.html',
  styleUrl: './catalog.scss',
})
export class Catalog {
  protected readonly products = [
    { name: 'Queen Bed', category: 'Furniture', rent: 'Rs 699/mo', deposit: 'Rs 2,500' },
    { name: '3-Seater Sofa', category: 'Furniture', rent: 'Rs 899/mo', deposit: 'Rs 3,000' },
    { name: 'Dining Set', category: 'Furniture', rent: 'Rs 649/mo', deposit: 'Rs 2,000' },
    { name: 'Single Door Fridge', category: 'Appliance', rent: 'Rs 799/mo', deposit: 'Rs 3,500' },
    { name: 'Washing Machine', category: 'Appliance', rent: 'Rs 899/mo', deposit: 'Rs 4,000' },
    { name: 'Smart TV 43"', category: 'Appliance', rent: 'Rs 999/mo', deposit: 'Rs 4,500' },
  ];
}
