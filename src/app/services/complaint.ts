import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Complaint } from '../models/complaint';
import { isPlatformBrowser } from '@angular/common';
import { getFirestore, collection, query, where, onSnapshot, addDoc, updateDoc, doc,getDoc, serverTimestamp, orderBy ,arrayUnion,increment,setDoc} from 'firebase/firestore';
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
                const complaints=snapshot.docs. map(doc=>({
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
   * Yeni kayıtta status, isArchived, supportCount ve createdAt otomatik eklenir.
   * Yöneticilere de yeni şikayet bildirimi gönderir.
   */
    async addComplaint(complaint: Complaint): Promise<void> {
        const complaintsRef = collection(this.db, 'complaints');
        //şikayeti veri tabanına kaydet
        await addDoc(complaintsRef, {
        ...complaint,
        status: 'Beklemede', // Varsayılan durum
        isArchived: false,   // Yeni şikayet arşivli olamaz
        supportCount: 1,     // İlk destek ekleyenin kendisinden
        createdAt: serverTimestamp() // Firestore sunucu saati
        });
        //yöneticilere bildirim gönder
        const bildirimlerRef=collection(this.db,'bildirimler');
        await addDoc(bildirimlerRef,{
            tip:'yeni',
            baslik:'Sisteme yeni şikayet eklendi',
            mesaj:`Yeni bir şikayet bildirildi. Lütfen kontrol ediniz.`,
            okundu:false,
            yonlendirme:'/guncel-sikayetler',
            targetRole:'admin',//sadece yöneticilere gider
            createdAt:serverTimestamp()
        });
    }
    /**
     * @description Yöneticinin şikayet durumunu değiştirmesini sağlar.
     * Şikayeti oluşturan kullanıcıya durum güncellemesi bildirimi gönderir.
     */
    /**
   * @description Yöneticinin şikayet durumunu değiştirmesini sağlar.
   * Şikayeti oluşturan kullanıcıya durumun içeriğine özel bildirim gönderir.
   */
async updateStatus(complaintId: string, newStatus: string): Promise<void> {
    const complaintDocRef = doc(this.db, 'complaints', complaintId);     
    // 1. Şikayeti okuyup kime ait olduğunu (userId) buluyoruz
    const snap = await getDoc(complaintDocRef);
    if (!snap.exists()) return;
    const complaintData = snap.data() as Complaint;
    // 2. Şikayetin durumunu güncelle 
    await updateDoc(complaintDocRef, { 
    status: newStatus
    });
    // 3. Şikayeti açan kullanıcıya duruma ÖZEL bildirim ateşle!
    if (complaintData.userId) {
    let bildirimTipi = 'guncelleme';
    let bildirimBaslik = 'Şikayet Durumu Güncellendi';
    let bildirimMesaji = `Şikayetinizin durumu "${newStatus}" olarak değiştirildi.`;
    // Duruma göre metinleri özelleştiriyoruz
    if (newStatus === 'İnceleniyor') {
        bildirimTipi = 'guncelleme';
        bildirimBaslik = 'Şikayetiniz İnceleniyor 🔍';
        bildirimMesaji = 'Bildirmiş olduğunuz şikayet yetkili birimler tarafından incelemeye alınmıştır.';
    } else if (newStatus === 'Çözüldü') {
        bildirimTipi = 'cozuldu';
        bildirimBaslik = 'Şikayetiniz Çözüldü ✅';
        bildirimMesaji = 'Şikayetiniz başarıyla çözüme kavuşturulmuştur. Geri bildiriminiz için teşekkür ederiz.';
    }

    const bildirimlerRef = collection(this.db, 'bildirimler');
    await addDoc(bildirimlerRef, {
        tip: bildirimTipi,
        baslik: bildirimBaslik,
        mesaj: bildirimMesaji,
        okundu: false,
        yonlendirme: '/guncel-sikayetler',
        userId: complaintData.userId, // SADECE ŞİKAYETİ AÇAN ÖĞRENCİYE GİDER
        createdAt: serverTimestamp()
    });
    }
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
/**
* @description şikayeti destekler. kullanıcı ID'sini listeye ekler ve sayacı 1 arttırır.
 */
async supportComplaint(complaintId:string,userId:string):Promise<void>{
    //Benzersiz Id oluştur(şikayetID-KullanıcıID)
    const supporrtDocId=`${complaintId}_${userId}`;
    //destekler koleksiyonunu referans al
    const supportRef=doc(this.db,'supports',supporrtDocId);
    //kullanıcı daha önce  bu şikayeti desteklemiş mi?
    const snap=await getDoc(supportRef);
    if(snap.exists()){
        console.warn('Bu kullanıcı bu şikayeti zaten desteklemiş.');
        return;//işlemi iptal et ve fonksiyondan çık
    }
    //yeni desteği ayrı koleksiyona kaydet
    await setDoc(supportRef,{
        complaintId:complaintId,
        userId:userId,
        createdAt:serverTimestamp()
    });
    //ana şikayet belgesindeki sadece destek sayacını 1 arttır
    const complaintDocRef=doc(this.db,'complaints',complaintId);
    await updateDoc(complaintDocRef,{
        supportCount:increment(1)
    });
}
/**
 * @description kullanıcının bu şikayeti daha önce destekleyip desteklemediğinikontrol eder
 * UI tarafında butonun rengini ve metnini değiştirmek için kullanılır
 */
async checkUserSupport(complaintId:string,userId:string): Promise<boolean>{
    if(!userId || !complaintId)return false;//güvenlik kontrolü
    //benzersiz ıd yi oluştur
    const supportDocId=`${complaintId}_${userId}`;
    const supportRef=doc(this.db,'supports',supportDocId);
    //belge var mı 
    const snap=await getDoc(supportRef);
    //belge varsa true,yoksa false dönsün
    return snap.exists();
}
}