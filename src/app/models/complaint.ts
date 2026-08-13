export interface Complaint {

    title: string;
    supportCount: number;
    description: string;
    metaInfo: string;
    status: string;    
    priority: string;//renkli noktaların türü için
    location:string;//konum bazlı gruplama ve sayım için
    // YENİ EKLENENLER: Harita entegrasyonu için koordinatlar
    lat: number;
    lng: number;

}
