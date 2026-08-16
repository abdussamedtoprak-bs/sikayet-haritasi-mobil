import { Timestamp } from 'firebase/firestore';

/**
 * @description Sistemdeki kullanıcı rollerini tanımlar.
 * Serbest string yerine union type kullanılmasının sebebi, yazım
 * hatalarının derleme aşamasında yakalanmasıdır.
 */
export type UserRole = 'student' | 'admin';

/**
 * @description Firestore'daki `users` koleksiyonunda tutulan kullanıcı kaydını temsil eder.
 * Kullanıcı ilk kez Google ile giriş yaptığında bu doküman otomatik oluşturulur.
 * Doküman kimliği (document id) daima Firebase Authentication uid'si ile aynıdır.
 */
export interface User {

  /**
   * @description Firebase Authentication tarafından üretilen benzersiz kullanıcı kimliği.
   * Firestore'daki doküman adı da bu değerdir (users/{uid}).
   */
  uid: string;

  /**
   * @description Kullanıcının e-posta adresi. Google hesabından otomatik alınır.
   * Kullanıcı tarafından değiştirilemez, Security Rules ile korunur.
   */
  email: string;

  /**
   * @description Kullanıcının ad ve soyadı. İlk girişte Google hesabından alınır,
   * sonrasında kullanıcı profil sayfasından güncelleyebilir.
   */
  fullName: string;

  /**
   * @description Google hesabındaki profil fotoğrafının adresi.
   * Fotoğrafı olmayan hesaplar için null döner.
   */
  photoUrl: string | null;

  /**
   * @description Kullanıcının sistemdeki yetki seviyesi.
   * Yeni kayıtlarda daima 'student' olarak başlar.
   *
   * 🔒 GÜVENLİK: Bu alan istemci tarafından ASLA değiştirilemez.
   * Yönetici yetkisi yalnızca Firebase Console üzerinden elle verilir (bootstrap admin).
   * Security Rules bu alana yapılacak istemci yazımlarını reddeder.
   */
  role: UserRole;

  /**
   * @description Yöneticinin sorumlu olduğu birim (örn. 'Güvenlik', 'Çevre', 'Yapı İşleri').
   * Öğrenci rolündeki kullanıcılarda null'dır.
   * İleride şikayetlerin ilgili birime yönlendirilmesi için kullanılacaktır.
   */
  department: string | null;

  /**
   * @description Hesabın aktif olup olmadığını belirtir.
   * Mezun olan öğrencilerin veya görevden ayrılan yöneticilerin erişimi,
   * kayıtları silinmeden bu alan false yapılarak kesilir.
   * Böylece geçmiş şikayet kayıtları bozulmaz.
   *
   * 🔒 GÜVENLİK: Bu alan da istemci tarafından değiştirilemez.
   */
  isActive: boolean;

  /**
   * @description Kullanıcının sisteme ilk giriş yaptığı (kaydının oluşturulduğu) an.
   * Sunucu saati ile yazılır, istemci saatine güvenilmez.
   */
  createdAt: Timestamp;

  /**
   * @description Kullanıcının en son giriş yaptığı an.
   * Her başarılı girişte güncellenir.
   */
  lastLoginAt: Timestamp;
}