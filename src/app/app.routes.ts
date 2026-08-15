import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { AyarlarComponent } from "./pages/ayarlar/ayarlar";
import {Complaints} from './pages/complaints/complaints';
import { BildirimlerComponent } from './pages/bildirimler/bildirimler';
import { DestekComponent } from './pages/destek/destek';
import { AnaSayfa } from './pages/ana-sayfa/ana-sayfa';
import { Profil } from './pages/profil/profil';
import { ProfilDuzenleme } from './pages/profil-duzenleme/profil-duzenleme';




export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'anasayfa', component: AnaSayfa },
  { path: 'ayarlar', component: AyarlarComponent },
  { path: 'complaints', component: Complaints },
  { path: 'bildirimler', component: BildirimlerComponent },
  { path: 'destek', component: DestekComponent },
  { path: 'profil',component: Profil },
  { path: 'profil-duzenleme', component: ProfilDuzenleme }

];