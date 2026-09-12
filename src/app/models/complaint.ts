export interface Complaint {
    title: string;
    supportCount: number;
    supporters?: string[]; // Destekleyen kullanıcıların Firebase UID'lerini tutacağımız liste
    description: string;
    metaInfo: string;
    status: string;    
    priority: string;//renkli noktaların türü için
    location:string;//konum bazlı gruplama ve sayım için
    // Harita entegrasyonu için koordinatlar
    lat: number;
    lng: number;
    userId: string;         // Şikayeti açan kişinin Firebase UID'si
    id?: string;            // Firestore doküman kimliği
    isArchived?: boolean;   // "Silinen" şikayetler için (varsayılan: false)
    
    /** @description Şikayetin arşivlendiği an. Arşivde değilse null. */
    archivedAt?: any;

    /** @description Şikayeti arşivleyen yöneticinin kimliği. Arşivde değilse null. */
    archivedBy?: string | null;


    
    /**
     * @description Kullanıcının şikayeti geri çektiği an.
     * Geri çekme silme değildir; kayıt yerinde kalır, yalnızca
     * durumu 'Geri Çekildi' olur ve dolaşımdan çıkarılır.
     */
    withdrawnAt?: any;

    /**
     * @description Şikayetin son düzenlendiği an.
     * Alan varsa şikayet bildirildikten sonra düzenlenmiş demektir.
     */
    updatedAt?: any;
    

    createdAt?: any;        // Sıralama ve tarih filtresi için (Firestore Timestamp)
    category?: string;      // (Opsiyonel) Kategori filtresinin daha sağlıklı çalışması için
        /**
     * @description Şikayete eklenen fotoğrafların kimlikleri.
     * Fotoğrafın kendisi Realtime Database'de, bilgileri Firestore'daki
     * medias koleksiyonunda tutulur. Şikayet başına en fazla 3 fotoğraf.
     */
    mediaIds?: string[];
}
