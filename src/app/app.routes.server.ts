import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * @description Sunucu tarafı render (SSR) ayarlarıdır.
 *
 * Tüm sayfalar Client modunda render edilir. Sebebi:
 * Kimlik doğrulama tarayıcı tarafında yapılır, sunucunun kullanıcının
 * oturum bilgisine erişimi yoktur. Sunucuda önceden render edilen sayfalar
 * daima "oturum kapalı" durumunu yansıtır ve yanlış içerik üretir.
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];