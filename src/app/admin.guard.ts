import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  const token = localStorage.getItem('token');
  const ruolo = localStorage.getItem('ruolo');

  if (token && ruolo === 'admin') {
    return true; 
  }

  router.navigate(['/login']);
  return false; 
};