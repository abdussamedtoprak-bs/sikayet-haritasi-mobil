import { Component, inject, signal, effect } from '@angular/core';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

/**
 * @description Kullanıcının kendi profil bilgilerini düzenlediği sayfadır.
 *
 * Düzenlenebilir tek alan ad-soyad bilgisidir. E-posta ve profil fotoğrafı
 * Google hesabından geldiği için salt okunur gösterilir.
 */
@Component({
  selector: 'app-profil-duzenleme',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './profil-duzenleme.html',
  styleUrls: ['./profil-duzenleme.css']
})
export class ProfilDuzenleme {

  private readonly location = inject(Location);

  /** @description Şablonda kullanıcı bilgilerine erişmek için public tanımlıdır. */
  readonly authService = inject(AuthService);

  /** @description Form alanındaki ad-soyad değeri. */
  readonly fullName = signal<string>('');

  /** @description Kaydetme işlemi sürüyor mu? */
  readonly saving = signal<boolean>(false);

  /** @description Kaydetme sırasında oluşan hata mesajı. */
  readonly errorMessage = signal<string | null>(null);

  /**
   * @description Formun bir kez doldurulmasını sağlar. Oturum bilgisi
   * asenkron geldiği için ilk geldiği anda form doldurulur, sonrasında
   * kullanıcının yazdıkları üzerine yazılmaz.
   */
  private formInitialized = false;

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();

      if (user && !this.formInitialized) {
        this.fullName.set(user.fullName);
        this.formInitialized = true;
      }
    });
  }

  /**
   * @description Profil bilgilerini kaydeder ve önceki sayfaya döner.
   */
  async save(): Promise<void> {
    this.errorMessage.set(null);
    this.saving.set(true);

    try {
      await this.authService.updateProfile({ fullName: this.fullName() });
      this.location.back();
    } catch (error: any) {
      this.errorMessage.set(error?.message ?? 'Kaydedilirken bir hata oluştu.');
    } finally {
      this.saving.set(false);
    }
  }

  /**
   * @description Değişiklikleri kaydetmeden önceki sayfaya döner.
   */
  goBack(): void {
    this.location.back();
  }
}