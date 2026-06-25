import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const token = localStorage.getItem('token');
  const ruolo = localStorage.getItem('ruolo');

  if (token && ruolo === 'admin' && !tokenScaduto(token)) {
    return true;
  }

  localStorage.clear();
  router.navigate(['/login']);
  return false;
};

function tokenScaduto(token: string): boolean {
  try {
    const payloadBase64Url = token.split('.')[1];

    let base64 = payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }

    const payloadJson = atob(base64);
    const payload = JSON.parse(payloadJson);

    if (!payload.exp) {
      return false;
    }

    const oraAttualeInSecondi = Math.floor(Date.now() / 1000);
    return payload.exp < oraAttualeInSecondi;

  } catch {
    return true;
  }
}