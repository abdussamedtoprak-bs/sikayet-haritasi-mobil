import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user';

/**
 * @description Belirli bir role sahip kullanıcıların erişebileceği sayfaları korur.
 *
 * Diğer guard'lardan farklı olarak parametre alır; bu yüzden doğrudan değil,
 * çağrılarak kullanılır:
 *
 *   canActivate: [roleGuard('admin')]
 *
 * ÖNEMLİ: Bu guard yalnızca kullanıcı deneyimi içindir. Asıl veri güvenliği
 * Firestore Security Rules tarafında sağlanır. Bir kullanıcı bu kontrolü
 * aşsa bile yetkisi olmayan veriye erişemez.
 *
 * @param {UserRole} allowedRole - Sayfaya erişebilecek rol
 * @returns {CanActivateFn} Router'ın kullanacağı guard fonksiyonu
 */
export const roleGuard = (allowedRole: UserRole): CanActivateFn => {

  return async () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    await authService.waitForAuthResolved();

    // Oturum yoksa önce giriş yapılmalı
    if (!authService.isLoggedIn()) {
      return router.createUrlTree(['/login']);
    }

    // Rol uygunsa erişime izin ver
    if (authService.role() === allowedRole) {
      return true;
    }

    // Yetkisiz erişim denemesi: ana sayfaya geri gönder
    return router.createUrlTree(['/anasayfa']);
  };
};