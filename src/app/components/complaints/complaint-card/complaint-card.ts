import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { Complaint } from '../../../models/complaint';
import { ComplaintService } from '../../../services/complaint';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-complaint-card',
  imports: [],
  templateUrl: './complaint-card.html',
  styleUrl: './complaint-card.css',
})
/**
 * @description Tek bir şikayet kaydının detaylarını kart tasarımıyla gösterir.
 * Yönetici için durum güncelleme ve arşivleme işlemlerini barındırır.
 * Tüm işlemler onay kutusu üzerinden yapılır, yanlışlıkla tıklamaya karşı korumalıdır.
 */
export class ComplaintCard implements OnInit {

  /**
   * @description Üst bileşenden gelen tekil şikayet nesnesidir.
   */
  @Input() complaint!: Complaint;

  /**
   * @description Kart arşiv görünümünde mi gösteriliyor?
   * Arşiv görünümünde durum butonları gizlenir, yerine "Geri Al" çıkar.
   */
  @Input() isArchiveView: boolean = false;

  private readonly complaintService = inject(ComplaintService);
  private readonly authService = inject(AuthService);

  currentUserRole: any = 'admin';

  /** @description Onay kutusunun görünürlüğü. */
  showConfirmModal: boolean = false;

  /** @description Onay bekleyen işlem türü. */
  pendingAction: 'status' | 'archive' | 'unarchive' | null = null;

  /** @description Onay bekleyen yeni durum (yalnızca durum güncellemesinde kullanılır). */
  pendingStatus: string = '';
    /** @description Şikayeti arşivleyen yöneticinin adı. */
  readonly arsivleyenAd = signal<string>('');

  ngOnInit(): void {
    // Arşiv görünümünde, şikayeti arşivleyen yöneticinin adını getir
    if (this.isArchiveView && this.complaint?.archivedBy) {
      this.authService
        .getUserName(this.complaint.archivedBy)
        .then(ad => this.arsivleyenAd.set(ad));
    }
  }
  /**
   * @description Durum değiştirme isteğini onay kutusuna taşır.
   */
  durumGuncelle(yeniDurum: string, event: Event) {
    event.stopPropagation();
    event.stopImmediatePropagation();

    this.pendingAction = 'status';
    this.pendingStatus = yeniDurum;
    this.showConfirmModal = true;
  }

  /**
   * @description Arşivleme isteğini onay kutusuna taşır.
   */
  arsivle(event: Event) {
    event.stopPropagation();
    event.stopImmediatePropagation();

    this.pendingAction = 'archive';
    this.showConfirmModal = true;
  }

  /**
   * @description Arşivden çıkarma isteğini onay kutusuna taşır.
   */
  geriAl(event: Event) {
    event.stopPropagation();
    event.stopImmediatePropagation();

    this.pendingAction = 'unarchive';
    this.showConfirmModal = true;
  }

  /**
   * @description Onay kutusundaki "Onayla" butonuna basıldığında,
   * bekleyen işlemi veritabanında uygular.
   */
  async onaylaGuncelleme(event: Event) {
    event.stopPropagation();
    event.stopImmediatePropagation();

    if (!this.complaint.id || !this.pendingAction) return;

    // Kullanıcı ikinci kez basamasın diye kutuyu hemen kapatıyoruz
    this.showConfirmModal = false;

    try {
      switch (this.pendingAction) {

        case 'status':
          await this.complaintService.updateStatus(this.complaint.id, this.pendingStatus);
          this.complaint.status = this.pendingStatus;
          break;

        case 'archive': {
          const adminId = this.authService.currentUser()?.uid ?? '';
          await this.complaintService.archiveComplaint(this.complaint.id, adminId);
          break;
        }

        case 'unarchive':
          await this.complaintService.unarchiveComplaint(this.complaint.id);
          break;
      }
    } catch (error) {
      console.error('İşlem sırasında hata oluştu:', error);
      alert('İşlem tamamlanamadı. Lütfen tekrar deneyin.');
    } finally {
      this.pendingAction = null;
    }
  }

  /**
   * @description Onay kutusundaki "İptal" butonuna basıldığında işlemi iptal eder.
   */
  iptalGuncelleme(event: Event) {
    event.stopPropagation();
    event.stopImmediatePropagation();

    this.showConfirmModal = false;
    this.pendingAction = null;
  }

    /**
   * @description Şikayetin arşivlenme tarihini okunabilir biçimde döndürür.
   * @returns {string} Gün/ay/yıl biçiminde tarih, yoksa boş metin
   */
  arsivTarihi(): string {
    const tarih = this.complaint.archivedAt;

    if (!tarih?.toDate) return '';

    return tarih.toDate().toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * @description Şikayetin arşivlenmeye aday olup olmadığını belirler.
   *
   * Çözülmüş ve üzerinden 30 günden fazla geçmiş şikayetler için
   * yöneticiye hatırlatma amacıyla bir işaret gösterilir.
   * Otomatik arşivleme yapılmaz, karar yöneticiye bırakılır.
   *
   * @returns {boolean} Arşivlenmeye aday ise true
   */
  arsivlenebilirMi(): boolean {
    // Zaten arşivdeyse gerek yok
    if (this.isArchiveView) return false;

    // Yalnızca çözülmüş şikayetler önerilir
    if (this.complaint.status !== 'Çözüldü') return false;

    const olusturmaTarihi = this.complaint.createdAt?.toDate?.();
    if (!olusturmaTarihi) return false;

    const gecenGun = (Date.now() - olusturmaTarihi.getTime()) / (1000 * 60 * 60 * 24);

    return gecenGun >= 30;
  }

}