import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Complaint } from '../models/complaint';

/**
 * @description Şikayet verilerinin yönetiminden (CRUD işlemleri) sorumlu servis katmanıdır.
 * Bileşenler (components) doğrudan veritabanı ile konuşmaz, bu servisi aracı olarak kullanır.
 */
@Injectable({
    providedIn: 'root'
    })
export class ComplaintService {

    // Firestore'a bağlayana kadar kullanacağımız geçici (mock) veri setimiz
    private mockComplaints: Complaint[] = [
        {
        title: 'Kırık Cam Tehlikesi',
        supportCount: 55,
        description: 'Kütüphane önünde yaklaşık 2 metre kare...',
        metaInfo: 'Güvenlik . 31.07.2026',
        status: 'İnceleniyor',
        priority: 'Acil'
        },
        {
        title: 'Kırık Yönlendirme Levhası',
        supportCount: 45,
        description: 'Kampüs haritasını gösteren levha...',
        metaInfo: 'Güvenlik . 28.07.2026',
        status: 'İnceleniyor',
        priority: 'Acil'
        },
        {
        title: 'Yabani Ot Temizliği',
        supportCount: 25,
        description: 'Yürüyüş yollarının kenarındaki ot...',
        metaInfo: 'Çevre . 31.07.2026 - 04.08.2026',
        status: 'Çözüldü',
        priority: 'Düşük'
        },
        {
        title: 'Hasarlı Bank',
        supportCount: 20,
        description: 'Kampüs bahçesindeki bankın oturma...',
        metaInfo: 'Çevre . 26.08.2026',
        status: 'Beklemede',
        priority: 'Düşük'
        }
    ];

    constructor() { }

    /**
     * @description Tüm şikayet listesini asenkron (Observable) olarak döndürür.
     * Tahtadaki "async" mimarisine uygun olarak tasarlandı.
     * @returns {Observable<Complaint[]>} Şikayet nesnelerinden oluşan akış (stream).
     */
    getComplaints(): Observable<Complaint[]> {
        // of() metodu, statik verimizi Firestore'dan geliyormuş gibi asenkron bir akışa çevirir
        return of(this.mockComplaints); 
    }
}