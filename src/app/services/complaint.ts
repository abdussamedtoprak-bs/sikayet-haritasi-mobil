import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Complaint } from '../models/complaint';
import { isPlatformBrowser } from '@angular/common';
import { getFirestore, collection, query, where, onSnapshot, addDoc, updateDoc, doc,getDoc,getDocs, serverTimestamp, orderBy ,arrayUnion,increment,setDoc} from 'firebase/firestore';
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
                // Öğrenci kendi şikayetlerinin hepsini görür; arşivleme yalnızca
        // yönetici listesini ve haritayı etkiler.
        const q = query(
            complaintsRef,
            where('userId', '==', userId),
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
            mesaj:`"${complaint.title}" konulu yeni bir şikayet bildirildi. Lütfen kontrol ediniz.`,
            okundu:false,
            yonlendirme:'/complaints',
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
    // ÇİFT BİLDİRİM KORUMASI: Durum zaten aynıysa işlemi tamamen durdur
    if (complaintData.status === newStatus) {
        console.warn("Durum zaten aynı, işlem iptal edildi.");
        return; 
    }
    // 2. Şikayetin durumunu güncelle 
    await updateDoc(complaintDocRef, { 
    status: newStatus
    });
    // 3. Şikayeti açan kullanıcıya duruma ÖZEL ve detaylı bildirim ateşle!
    if (complaintData.userId) {
        let bildirimTipi = 'guncelleme';
        let bildirimBaslik = 'Şikayetiniz Güncellendi'; // Figma tasarımına uygun sabit başlık
        
        // Şikayet başlığını (title) mesajın içine dinamik olarak yerleştiriyoruz
        let bildirimMesaji = `"${complaintData.title}" konulu şikayetinizin durumu "${newStatus}" olarak değiştirildi.`;
        
        if (newStatus === 'İnceleniyor') {
            bildirimTipi = 'guncelleme';
            bildirimMesaji = `"${complaintData.title}" konulu şikayetiniz yetkili birimler tarafından incelemeye alınmıştır.`;
        } else if (newStatus === 'Çözüldü') {
            bildirimTipi = 'cozuldu';
            bildirimMesaji = `"${complaintData.title}" konulu şikayetiniz başarıyla çözüme kavuşturulmuştur.`;
        }

        const bildirimlerRef = collection(this.db, 'bildirimler');
        await addDoc(bildirimlerRef, {
            tip: bildirimTipi,
            baslik: bildirimBaslik,
            mesaj: bildirimMesaji,
            okundu: false,
            yonlendirme: '/user-complaints', // Kullanıcı kendi şikayetlerini görebileceği sayfaya yönlensin
            targetRole: 'user', // Sadece ilgili kullanıcıya gider
            userId: complaintData.userId, 
            createdAt: serverTimestamp()
        });
    }
}


/**
 * @description Şikayeti silmek yerine arşivler.
 *
 * Arşivlenen şikayet yönetici listesinden ve haritadan kalkar, ancak
 * veritabanında durmaya devam eder. Şikayeti açan öğrenci kendi
 * sayfasında görmeye devam eder.
 *
 * @param {string} complaintId - Arşivlenecek şikayetin kimliği
 * @param {string} adminId - İşlemi yapan yöneticinin kimliği
 */
async archiveComplaint(complaintId: string, adminId: string): Promise<void> {
    const complaintDocRef = doc(this.db, 'complaints', complaintId);

    await updateDoc(complaintDocRef, {
        isArchived: true,
        archivedAt: serverTimestamp(),
        archivedBy: adminId
    });
}

/**
 * @description Arşivlenmiş bir şikayeti tekrar aktif listeye döndürür.
 *
 * @param {string} complaintId - Arşivden çıkarılacak şikayetin kimliği
 */
async unarchiveComplaint(complaintId: string): Promise<void> {
    const complaintDocRef = doc(this.db, 'complaints', complaintId);

    await updateDoc(complaintDocRef, {
        isArchived: false,
        archivedAt: null,
        archivedBy: null
    });
}

/**
 * @description Arşivlenmiş şikayetleri gerçek zamanlı olarak getirir.
 * Yalnızca yönetici arşiv görünümünde kullanılır.
 *
 * @returns {Observable<Complaint[]>} Arşivlenmiş şikayet akışı
 */
getArchivedComplaints(): Observable<Complaint[]> {
    return new Observable<Complaint[]>(observer => {

        if (!this.isBrowser) {
            observer.next([]);
            observer.complete();
            return;
        }

        const complaintsRef = collection(this.db, 'complaints');

        const q = query(
            complaintsRef,
            where('isArchived', '==', true),
            orderBy('archivedAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const complaints = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Complaint));

            observer.next(complaints);
        }, (error) => {
            console.error('Arşivlenmiş şikayetler çekilirken hata:', error);
            observer.error(error);
        });

        return () => unsubscribe();
    });
}




/**
   * @description Şikayeti destekler. Aynı kullanıcının iki kez desteklemesini engeller.
   * Eşik değerlerine (10, 20) ulaşıldığında önceliği günceller ve yöneticiye bildirim atar.
   */
    async supportComplaint(complaintId: string, userId: string): Promise<void> {
        // 1. Benzersiz ID oluştur (ŞikayetID_KullanıcıID)
        const supportDocId = `${complaintId}_${userId}`;
        const supportRef = doc(this.db, 'supports', supportDocId);

        // 2. Kullanıcı daha önce bu şikayeti desteklemiş mi diye kontrol et
        const snap = await getDoc(supportRef);
        if (snap.exists()) {
        console.warn('Bu kullanıcı bu şikayeti zaten desteklemiş.');
        return; // İşlemi iptal et
        }

        // 3. Ana şikayet belgesini oku (Başlığı ve güncel destek sayısını öğrenmek için)
        const complaintDocRef = doc(this.db, 'complaints', complaintId);
        const complaintSnap = await getDoc(complaintDocRef);
        
        if (!complaintSnap.exists()) return;
        
        const complaintData = complaintSnap.data();
        const guncelDestekSayisi = (complaintData['supportCount'] || 0) + 1;
        
        // 4. Senin fonksiyonunla yeni önceliği hesapla
        const yeniOncelik = this.hesaplaOncelik(guncelDestekSayisi);

        // 5. Yeni desteği ayrı koleksiyona kaydet
        await setDoc(supportRef, {
        complaintId: complaintId,
        userId: userId,
        createdAt: serverTimestamp()
        });

        // 6. Şikayetin sayacını ve YENİ ÖNCELİĞİNİ güncelle
        await updateDoc(complaintDocRef, {
        supportCount: guncelDestekSayisi,
        priority: yeniOncelik
        });

        // 7. EŞİK KONTROLÜ VE YÖNETİCİ BİLDİRİMİ (Sadece 10 ve 20'de çalışır)
        if (guncelDestekSayisi === 10 || guncelDestekSayisi === 20) {
        const bildirimlerRef = collection(this.db, 'bildirimler');
        await addDoc(bildirimlerRef, {
            tip: 'destek', // UI tarafında zil veya ünlem ikonu için kullanabilirsin
            baslik: 'Destek Eşiği Aşıldı',
            mesaj: `"${complaintData['title']}" şikayeti ${guncelDestekSayisi} destek aldı, önceliği "${yeniOncelik}" olarak yükseldi.`,
            okundu: false,
            yonlendirme: '/complaints',
            targetRole: 'admin',
            createdAt: serverTimestamp()
        });
        }
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
/**
   * @description Beklemede olan ve üzerinden 7 gün geçen şikayetleri tespit edip yöneticiyi toplu olarak uyarır.
   */
    async checkPendingComplaints(): Promise<void> {
        // 1. Sadece 'Beklemede' olan ve arşivlenmemiş şikayetleri getir
        const complaintsRef = collection(this.db, 'complaints');
        const q = query(
        complaintsRef,
        where('status', '==', 'Beklemede'),
        where('isArchived', '==', false)
        );
        const snap = await getDocs(q);
        if (snap.empty) return; // Hiç bekleyen şikayet yoksa çık
        const simdi = new Date().getTime();  
        // 7 Gün = 7 * 24 * 60 * 60 * 1000 milisaniye
        // TEST İÇİN BUNU 1 DAKİKA YAPABİLİRSİN: const yediGunMilisaniye = 1 * 60 * 1000;
        const yediGunMilisaniye = 7 * 24 * 60 * 60 * 1000; 
        let uyarilacakSikayetSayisi = 0;
        // 2. Şikayetleri tek tek dolaş ve sürelerini ölç
        for (const docSnap of snap.docs) {
        const data = docSnap.data();
        // Bu şikayet için daha önce uyarı gönderilmiş mi? (Spam engeli)
        if (data['warningSent']) continue;
        // Şikayetin oluşturulma tarihi var mı?
        if (data['createdAt'] && data['createdAt'].toDate) {
            const olusturulmaTarihi = data['createdAt'].toDate().getTime();
            const gecenSure = simdi - olusturulmaTarihi;
            // 3. Eğer geçen süre 7 günü (veya belirlediğin süreyi) aştıysa:
            if (gecenSure > yediGunMilisaniye) {
            uyarilacakSikayetSayisi++;
            // Şikayeti bir daha bildirim göndermemek üzere işaretle
            const complaintDocRef = doc(this.db, 'complaints', docSnap.id);
            await updateDoc(complaintDocRef, {
                warningSent: true
            });
            }
        }
        }
          // 4. Eğer süresi dolan şikayet(ler) varsa TEK BİR toplu bildirim gönder
        if (uyarilacakSikayetSayisi > 0) {
        const bildirimlerRef = collection(this.db, 'bildirimler');
        await addDoc(bildirimlerRef, {
            tip: 'uyari',
            baslik: 'Bekleyen Şikayet Uyarısı',
            mesaj: `${uyarilacakSikayetSayisi} şikayet 7 günden uzun süre beklemede.`,
            okundu: false,
            yonlendirme: '/complaints',
            targetRole: 'admin',
            createdAt: serverTimestamp()
        });
        }
    }
}