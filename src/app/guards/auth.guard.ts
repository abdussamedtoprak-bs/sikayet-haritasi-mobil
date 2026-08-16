import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * @description Yalnızca oturumu açık kullanıcıların erişebileceği sayfaları korur.
 *
 * Oturum durumu Firebase tarafından bildirilene kadar bekler; bu sayede
 * sayfa yenilendiğinde giriş yapmış kullanıcı yanlışlıkla login sayfasına
 * yönlendirilmez.
 *
 * Oturum yoksa kullanıcı login sayfasına gönderilir.
 */
export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  await authService.waitForAuthResolved();

  if (authService.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};