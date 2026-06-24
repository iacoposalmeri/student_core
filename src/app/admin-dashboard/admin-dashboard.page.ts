import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
  standalone: false
})
export class AdminDashboardPage implements OnInit {
  
  nomeAdmin: string = '';

  constructor(
    private router: Router,
    private menuCtrl: MenuController
  ) { }

  ngOnInit() {
    this.nomeAdmin = localStorage.getItem('nome') || 'Amministratore';
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(false, 'menu-studente');
    this.menuCtrl.enable(true, 'menu-admin');

    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    
    document.body.classList.add('theme-admin');
  }

  logout() {
    this.menuCtrl.enable(true, 'menu-studente');
    this.menuCtrl.enable(false, 'menu-admin');
    
    document.body.classList.remove('theme-admin');
    
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}