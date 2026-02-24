import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'midi-explorer',
    loadComponent: () => import('./pages/midi-explorer/midi-explorer.component').then(m => m.MidiExplorerComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
