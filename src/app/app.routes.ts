import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'editor',
    loadComponent: () => import('./pages/patch-editor/patch-editor.component').then(m => m.PatchEditorComponent)
  },
  {
    path: 'library',
    loadComponent: () => import('./pages/patch-library/patch-library.component').then(m => m.PatchLibraryComponent)
  },
  {
    path: 'librarian',
    loadComponent: () => import('./pages/librarian/librarian.component').then(m => m.LibrarianComponent)
  },
  {
    path: 'demo',
    loadComponent: () => import('./pages/component-demo/component-demo.component').then(m => m.ComponentDemoComponent)
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
