import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { AyarlarComponent } from "./pages/ayarlar/ayarlar";
import {Complaints} from './pages/complaints/complaints';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'ayarlar', component: AyarlarComponent },
  { path: 'complaints', component: Complaints },

];