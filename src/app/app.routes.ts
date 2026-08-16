import { Routes } from '@angular/router';

import { LoginComponent } from './pages/login/login';
import { AnaSayfa } from './pages/ana-sayfa/ana-sayfa';
import { Profil } from './pages/profil/profil';
import { AyarlarComponent } from './pages/ayarlar/ayarlar';
import { Complaints } from './pages/complaints/complaints';
import { BildirimlerComponent } from './pages/bildirimler/bildirimler';
import { DestekComponent } from './pages/destek/destek';

import { authGuard } from './guards/auth.guard';
import { noAuthGuard } from './guards/no-auth.guard';
import { roleGuard } from './guards/role.guard';

/**
 * @description Uygulamanın route tanımlarıdır.
 *
 * Erişim katmanları:
 * - noAuthGuard  → yalnızca oturumu kapalı kullanıcılar (login sayfası)
 * - authGuard    → yalnızca giriş yapmış kullanıcılar
 * - roleGuard    → yalnızca belirtilen role sahip kullanıcılar
 *
 * NOT: Guard'lar kullanıcı deneyimi ve route erişimi içindir.
 * Asıl veri güvenliği Firestore Security Rules ile sağlanır.
 */
export const routes: Routes = [

  // Kök adres: oturum varsa ana sayfaya, yoksa authGuard login'e yönlendirir
  { path: '', redirectTo: 'anasayfa', pathMatch: 'full' },

  // ── Oturum GEREKTİRMEYEN sayfalar ──
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [noAuthGuard]
  },

  // ── Oturum gerektiren sayfalar (her iki rol) ──
  {
    path: 'anasayfa',
    component: AnaSayfa,
    canActivate: [authGuard]
  },
  {
    path: 'profil',
    component: Profil,
    canActivate: [authGuard]
  },
  {
    path: 'bildirimler',
    component: BildirimlerComponent,
    canActivate: [authGuard]
  },
  {
    path: 'destek',
    component: DestekComponent,
    canActivate: [authGuard]
  },
  {
    path: 'ayarlar',
    component: AyarlarComponent,
    canActivate: [authGuard]
  },

  // ── Yalnızca YÖNETİCİ sayfaları ──
  // Öğrenci bu adresi URL'ye yazsa bile ana sayfaya geri gönderilir.
  {
    path: 'complaints',
    component: Complaints,
    canActivate: [authGuard, roleGuard('admin')]
  },

  // Tanımsız adresler ana sayfaya yönlendirilir
  { path: '**', redirectTo: 'anasayfa' }
];