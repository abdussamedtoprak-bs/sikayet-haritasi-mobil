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
    createdAt?: any;        // Sıralama ve tarih filtresi için (Firestore Timestamp)
    category?: string;      // (Opsiyonel) Kategori filtresinin daha sağlıklı çalışması için
    imageUrl?: string;     // Şikayete eklenen fotoğrafın adresi
}
