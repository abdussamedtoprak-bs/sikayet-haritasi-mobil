import { Component, inject, signal, effect } from '@angular/core';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

/**
 * @description Kullanıcının kendi profil bilgilerini düzenlediği sayfadır.
 * E-posta ve profil fotoğrafı Google hesabından geldiği için salt okunur gösterilir.
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
  readonly authService = inject(AuthService);

  readonly fullName = signal<string>('');
  readonly saving = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  private formInitialized = false;

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();

      if (user && !this.formInitialized) {
        this.fullName.set(user.fullName || '');
        this.formInitialized = true;
      }
    });
  }

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

  goBack(): void {
    this.location.back();
  }
}