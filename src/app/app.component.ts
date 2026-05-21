import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false
})
export class AppComponent {
  constructor(
    private router: Router,
    private menuCtrl: MenuController 
  ) {}

  logout() {
    localStorage.clear(); 
    this.menuCtrl.close(); 
    this.router.navigate(['/login']); 
  }
}