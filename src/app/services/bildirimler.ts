import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Bildirim } from '../models/bildirim';
// DİKKAT: getFirestore eklendi
import { Firestore, getFirestore, collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class BildirimlerService {
    // Angular inject() YERİNE projenin stiline uygun şekilde tanımlıyoruz
    private db: Firestore;
    private authService = inject(AuthService);
    private platformId = inject(PLATFORM_ID);
    private isBrowser = isPlatformBrowser(this.platformId);
    bildirimler = signal<Bildirim[]>([]);
    private unsubscribe: any = null;
    constructor() {
        // ÇÖZÜM BURASI: Veritabanı bağlantısını senin diğer servislerde yaptığın gibi kurduk
        this.db = getFirestore();
    }
    dinlemeyiBaslat() {
        if (!this.isBrowser) return;
        const user = this.authService.currentUser();
        const role = this.authService.role();
        if (!user || !role) return;
        const notificationsRef = collection(this.db, 'bildirimler');
        let q;
        // Rol Tabanlı Filtreleme
        if (role === 'admin') {
        q = query(notificationsRef, where('targetRole', '==', 'admin'));
        } else {
        q = query(notificationsRef, where('userId', '==', user.uid));
        }
        this.unsubscribe = onSnapshot(q, (snapshot) => {
        const gelenBildirimler = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Bildirim));      
        // Firebase index hatasına takılmamak için tarihe göre sıralamayı JavaScript ile yapıyoruz
        gelenBildirimler.sort((a, b) => {
            const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
            const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
            return timeB - timeA;
        });
        this.bildirimler.set(gelenBildirimler);
        }, (error) => {
        console.error('Bildirimler çekilirken hata oluştu:', error);
        });
    }
    dinlemeyiDurdur() {
        if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
        }
    }
    async bildirimiOkunduYap(bildirimId: string) {
        if (!bildirimId) return;
        const bildirimRef = doc(this.db, 'bildirimler', bildirimId);
        await updateDoc(bildirimRef, { okundu: true });
    }
    async tumunuOkunduYap() {
        const okunmamislar = this.bildirimler().filter(b => !b.okundu && b.id);
        for (const b of okunmamislar) {
        if (b.id) {
            const bildirimRef = doc(this.db, 'bildirimler', b.id);
            await updateDoc(bildirimRef, { okundu: true });
        }
        }
    }
}