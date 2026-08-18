import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Complaint } from '../models/complaint';
import { isPlatformBrowser } from '@angular/common';
import { getFirestore, collection, query, where, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
/**
 * @description Şikayet verilerinin yönetiminden (CRUD işlemleri) sorumlu servis katmanıdır.
 * Bileşenler (components) doğrudan veritabanı ile konuşmaz, bu servisi aracı olarak kullanır.
 */
@Injectable({
    providedIn: 'root'
    })
export class ComplaintService {

    //1.SSR koruması için platform kontrolü
    private readonly platformId=inject(PLATFORM_ID);
    private readonly isBrowser=isPlatformBrowser(this.platformId);

    //2.firestore veritabanı referansı 
    private readonly db=getFirestore();

    constructor() { }

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

    /**
     * @description Tüm aktif şikayetleri (arşivlenmemiş) gerçek zamanlı olarak getirir.
     * Harita pinleri ve yönetici sayfası için kullanılır.
     * @returns {Observable<Complaint[]>} Şikayet nesnelerinden oluşan akış
    */
    getComplaints(): Observable<Complaint[]>{
        return new Observable<Complaint[]>(observer=>{
            //SSR koruması: sadece tarayıcıdaysak canlı dinleyiciyi başlat
            if(!this.isBrowser){
                observer.next([]);
                observer.complete();
                return;
            }
            const complaintsRef=collection(this.db,'complaints');
            //sadece arşivlenmemişleri getir ve en yeniye göre sırala
            const q=query(
                complaintsRef,
                where('isArchived','==',false),
                orderBy('createdAt','desc')
            );
 
            //onSnapShot ile gerçek zamanlı dinleme
            const unsubscribe=onSnapshot(q,(snapshot)=>{
                const complaints=snapshot.docs.map(doc=>({
                    id:doc.id,//firestore belgesinin benzersiz id sinii ekliyoruz
                    ...doc.data()
                }as Complaint));
                observer.next(complaints);
                },(error)=>{
                    console.error('şikayetleri çekerken hata:',error);
                    observer.error(error);
                });
                //observable iptal edildiğinde dinleyiciyi durdur
                return ()=> unsubscribe();
        })
    }


    /**
     * @description Belirli bir kullanıcının aktif şikayetlerini gerçek zamanlı getirir.
     * Fatma'nın "Şikayetlerim" sayfası için kullanılır.
    */
    getMyComplaints(userId: string): Observable<Complaint[]> {
    return new Observable<Complaint[]>(observer => {
        if (!this.isBrowser) {
            observer.next([]);
            observer.complete();
            return;
        }

        const complaintsRef = collection(this.db, 'complaints');
        const q = query(
            complaintsRef,
            where('userId', '==', userId),
            where('isArchived', '==', false),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const complaints = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
            } as Complaint));
            observer.next(complaints);
        }, (error) => {
            console.error('Kullanıcı şikayetlerini çekerken hata:', error);
            observer.error(error);
        });

        return () => unsubscribe();
        });
    }

    /**
   * @description Yeni şikayet oluşturur ve Firestore'a kaydeder.
   * Abdussamed'in notu: Yeni kayıtta status, isArchived, supportCount ve createdAt otomatik eklenir.
   */
    async addComplaint(complaint: Complaint): Promise<void> {
        const complaintsRef = collection(this.db, 'complaints');
        await addDoc(complaintsRef, {
        ...complaint,
        status: 'Beklemede', // Varsayılan durum
        isArchived: false,   // Yeni şikayet arşivli olamaz
        supportCount: 1,     // İlk destek ekleyenin kendisinden
        createdAt: serverTimestamp() // Firestore sunucu saati
        });
    }

    /**
     * @description Yöneticinin şikayet durumunu değiştirmesini sağlar.
     */
    async updateStatus(complaintId: string, newStatus: string): Promise<void> {
        const complaintDocRef = doc(this.db, 'complaints', complaintId);
        await updateDoc(complaintDocRef, {
        status: newStatus
        });
    }

    /**
     * @description Şikayeti veritabanından silmek yerine arşivler.
     */
    async archiveComplaint(complaintId: string): Promise<void> {
        const complaintDocRef = doc(this.db, 'complaints', complaintId);
        await updateDoc(complaintDocRef, {
        isArchived: true
        });
    }
}