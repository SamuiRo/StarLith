import { Routes } from '@angular/router';
import { Loading } from './components/loading/loading';
import { Home } from './components/home/home';
import { Aboutme } from './components/aboutme/aboutme';
import { Projects } from './components/projects/projects';
import { Skills } from './components/skills/skills';
import { Contact } from './components/contact/contact';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/loading',
    pathMatch: 'full',
  },
  {
    path: 'loading',
    title: 'Loading — StarLith',
    component: Loading,
  },
  {
    path: 'home',
    title: 'Serhii Vasiliev — Full-Stack Engineer (Node.js / Angular)',
    component: Home,
  },
  {
    path: 'aboutme',
    title: 'About Me — Serhii Vasiliev | StarLith',
    component: Aboutme,
  },
  {
    path: 'projects',
    title: 'Projects — Serhii Vasiliev | StarLith',
    component: Projects,
  },
  {
    path: 'skills',
    title: 'Skills — Serhii Vasiliev | StarLith',
    component: Skills,
  },
  {
    path: 'contact',
    title: 'Contact — Serhii Vasiliev | StarLith',
    component: Contact,
  },
  {
    path: '**',
    redirectTo: '/loading',
  },
];
