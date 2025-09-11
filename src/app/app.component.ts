import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MyComponentComponent } from './my-component/my-component.component';
import { MaterialModule } from './shared/material.module';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MyComponentComponent, MaterialModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Kanban Task Manager';
}
