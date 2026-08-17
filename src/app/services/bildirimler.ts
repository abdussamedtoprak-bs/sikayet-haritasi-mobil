import { Injectable, signal } from '@angular/core';
import { Bildirim } from '../models/bildirim';

@Injectable({
    providedIn: 'root'
    })
    class BildirimlerService {
    bildirimler = signal<Bildirim[]>([]);

    yeniBildirimEkle(bildirimVerisi: { tip: any; baslik: string; mesaj: string; yonlendirme: string }) {
        const mevcutListe = this.bildirimler();
        const yeniId = mevcutListe.length > 0 ? Math.max(...mevcutListe.map(b => b.id)) + 1 : 1;

        const tamBildirim: Bildirim = {
        id: yeniId,
        tip: bildirimVerisi.tip,
        baslik: bildirimVerisi.baslik,
        mesaj: bildirimVerisi.mesaj,
        zaman: 'Az önce',
        okundu: false,
        yonlendirme: bildirimVerisi.yonlendirme
        };

        this.bildirimler.update(liste => [tamBildirim, ...liste]);
    }
}
export { BildirimlerService };