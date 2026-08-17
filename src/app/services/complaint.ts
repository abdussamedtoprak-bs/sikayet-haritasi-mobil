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
        priority: 'Acil',
        location: 'kütüphane önü',
        lat: 38.89860734018667, 
        lng: 40.48585394300411,
        userId: 'test-kullanici-1'

        },
        {
        title: 'Kırık Yönlendirme Levhası',
        supportCount: 45,
        description: 'Kampüs haritasını gösteren levha...',
        metaInfo: 'Güvenlik . 28.07.2026',
        status: 'İnceleniyor',
        priority: 'Acil',
        location: 'kütüphane önü',
        lat: 38.89745422243869, 
        lng: 40.49077315851337,
        userId: 'test-kullanici-2'
        },
        {
        title: 'Yabani Ot Temizliği',
        supportCount: 25,
        description: 'Yürüyüş yollarının kenarındaki ot...',
        metaInfo: 'Çevre . 31.07.2026 - 04.08.2026',
        status: 'Çözüldü',
        priority: 'Düşük',
        location: 'Yürüyüş Yolu',
        lat: 38.89801482869674, 
        lng: 40.4879569074668,
        userId: 'test-kullanici-3'
        },
        {
        title: 'Hasarlı Bank',
        supportCount: 20,
        description: 'Kampüs bahçesindeki bankın oturma...',
        metaInfo: 'Çevre . 26.08.2026',
        status: 'Beklemede',
        priority: 'Düşük',
        location: 'Merkez Kampüs Bahçe',
        lat: 38.898996440173754, 
        lng: 40.48619827302908,
        userId: 'test-kullanici-4'
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

    /**
     * @description 
     */
    addComplaint(yeniSikayet: Complaint): void{
        //yeni şikayeti dizinin en başına ekliyoruz ki listelendiğinde en üstte görünsün
        this.mockComplaints.unshift(yeniSikayet);
    }

    /**
     * @description destekçi sayısına göre şikayetin önceliğini dinamik olarak hesaplar
     */
    hesaplaOncelik(destekSayisi:number):string{
        if(destekSayisi>=20){
            return 'Acil';
        }else if(destekSayisi>=10){
            return 'Orta';
        }else{
            return 'Düşük';
        }
    }
}