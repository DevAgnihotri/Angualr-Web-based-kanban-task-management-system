import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-component',
  imports: [CommonModule],
  templateUrl: './my-component.component.html',
  styleUrl: './my-component.component.css'
})
export class MyComponentComponent {
  clickCount = 0;
  createdDate = new Date().toLocaleDateString();

  onButtonClick() {
    this.clickCount++;
    console.log(`Button clicked ${this.clickCount} times!`);
  }
}
