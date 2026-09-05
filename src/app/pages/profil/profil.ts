import { Component, inject, signal, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ComplaintService } from '../../services/complaint';

/**
 * @description Kullanıcının kendi profil bilgilerini ve şikayet istatistiklerini
 * görüntülediği sayfadır. İstatistikler kullanıcının kendi şikayetlerinden
 * gerçek zamanlı olarak hesaplanır.
 */
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profil.html',
  styleUrl: './profil.css',
})
export class Profil implements OnDestroy {

  private readonly router = inject(Router);
  private readonly complaintService = inject(ComplaintService);

  readonly authService = inject(AuthService);

  /** @description Kullanıcının bildirdiği toplam şikayet sayısı. */
  readonly totalCount = signal<number>(0);

  /** @description Çözüme kavuşmuş şikayet sayısı. */
  readonly resolvedCount = signal<number>(0);

  /** @description Henüz çözülmemiş (bekleyen veya incelenen) şikayet sayısı. */
  readonly pendingCount = signal<number>(0);

  /** @description Şikayet akışına ait abonelik. Kullanıcı değişince yenilenir. */
  private statsSubscription?: Subscription;

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();

      // Önceki aboneliği kapat, birden fazla akış birikmesin
      this.statsSubscription?.unsubscribe();

      if (!user) {
        this.totalCount.set(0);
        this.resolvedCount.set(0);
        this.pendingCount.set(0);
        return;
      }

      this.statsSubscription = this.complaintService
        .getMyComplaints(user.uid)
        .subscribe({
          next: (list) => {
            this.totalCount.set(list.length);

            this.resolvedCount.set(
              list.filter(c => c.status === 'Çözüldü').length
            );

            // Çözülmemiş her şikayet "bekleyen" sayılır
            // (Beklemede ve İnceleniyor durumları birlikte)
            this.pendingCount.set(
              list.filter(c => c.status !== 'Çözüldü').length
            );
          },
          error: (error) => {
            console.error('Profil istatistikleri yüklenemedi:', error);
          }
        });
    });
  }

    /**
   * @description Sayfadan ayrılırken istatistik akışını kapatır.
   * Çıkış yapıldığında da bu metot çalışır, çünkü giriş sayfasına
   * yönlendirme bu bileşeni yok eder.
   */
  ngOnDestroy(): void {
    this.statsSubscription?.unsubscribe();
  }


  geriDon() {
    this.router.navigate(['/anasayfa']);
  }

  kisiselBilgiler() {
    this.router.navigate(['/profil-duzenleme']);
  }
}