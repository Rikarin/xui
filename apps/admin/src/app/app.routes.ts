import { inject } from '@angular/core';
import { type CanActivateFn, Router, type Routes } from '@angular/router';
import { Session } from './core/session';

/**
 * Sends anyone without a session to the sign-in screen, remembering where they were headed.
 *
 * There is no real authentication behind it — see {@link Session} — but the shape is the one a real
 * app needs, including the redirect back afterwards.
 */
const signedIn: CanActivateFn = (_route, state) => {
  const session = inject(Session);
  const router = inject(Router);

  return session.isAuthenticated() || router.createUrlTree(['/sign-in'], { queryParams: { next: state.url } });
};

export const routes: Routes = [
  {
    path: 'sign-in',
    loadComponent: () => import('./pages/sign-in').then(m => m.SignIn),
    title: 'Sign in — Northwind Admin'
  },
  {
    path: '',
    canActivate: [signedIn],
    loadComponent: () => import('./shell/shell').then(m => m.Shell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard').then(m => m.Dashboard),
        title: 'Dashboard — Northwind Admin'
      },
      {
        path: 'customers',
        loadComponent: () => import('./pages/customers/customers').then(m => m.Customers),
        title: 'Customers — Northwind Admin'
      },
      {
        path: 'orders',
        loadComponent: () => import('./pages/orders').then(m => m.Orders),
        title: 'Orders — Northwind Admin'
      },
      {
        path: 'products',
        loadComponent: () => import('./pages/products').then(m => m.Products),
        title: 'Products — Northwind Admin'
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/settings').then(m => m.Settings),
        title: 'Settings — Northwind Admin'
      },
      { path: '**', loadComponent: () => import('./pages/not-found').then(m => m.NotFound), title: 'Not found' }
    ]
  }
];
