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
    title: 'Loading',
    component: Loading,
  },
  {
    path: 'home',
    title: 'Home',
    component: Home,
  },
  {
    path: 'aboutme',
    title: 'About Me',
    component: Aboutme,
  },
  {
    path: 'projects',
    title: 'Projects',
    component: Projects,
  },
  {
    path: 'skills',
    title: 'Skills',
    component: Skills,
  },
  {
    path: 'contact',
    title: 'Contact',
    component: Contact,
  },
  {
    path: '**',
    redirectTo: '/loading',
  },
];
