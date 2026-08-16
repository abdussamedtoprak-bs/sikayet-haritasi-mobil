import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * @description Yalnızca oturumu KAPALI kullanıcıların erişebileceği sayfaları korur.
 *
 * Giriş yapmış bir kullanıcının login sayfasına geri dönmesini engeller,
 * doğrudan ana sayfaya yönlendirir.
 */
export const noAuthGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  await authService.waitForAuthResolved();

  if (!authService.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/anasayfa']);
};