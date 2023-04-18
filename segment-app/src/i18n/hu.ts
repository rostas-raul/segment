import { AuthMessages } from '@/types/Api';

const hu = {
  ok: 'OK',

  auth: {
    inputLabelUsername: 'Felhasználónév',
    inputLabelPassword: 'Jelszó',
    inputPlaceholderUsername: 'Írja be felhasználónevét',
    inputPlaceholderPassword: 'Írja be a jelszavát',

    userserverLabel: 'Jelenlegi felhasználói szerver:',

    serverNotAvailable: 'Ez a felhasználói szerver jelenleg nem elérhető.',
    failedToUploadKeys:
      'Egy ismeretlen hiba történt a kulcsok feltöltése közben. Probáld újra később.',

    login: {
      alternateActionPre: 'Nincs még profilod?',
      alternateAction: 'Regisztráció',
      buttonText: 'Bejelentkezés',
    },
    register: {
      alternateActionPre: 'Már van profilod?',
      alternateAction: 'Bejelentkezés',
      buttonText: 'Regisztráció',
      success: 'Sikeres regisztráció!',
    },
  },

  chat: {
    failedToFetchRooms:
      'Váratlan hiba történt a szobák lekérdezése közben. Kérjük, próbálja meg később újra.',
    emptyRoom:
      'Úgy tűnik, ez a szoba üres. Legyél te az első, aki mond valamit!',
    createChatRoom: {
      header: 'Csevegőszoba Létrehozása',
      inputLabelRoomName: 'Szobanév',
      inputPlaceholderRoomName: 'A fantasztikus szobám!',
      inputLabelRoomDescription: 'Szobaleírás',
      inputPlaceholderRoomDescription: 'Csak nekem és barátaimnak!',
      inputLabelRoomPassword: 'Szoba jelszó',
      inputPlaceholderRoomPassword: 'SzuperTitkosJelszó1234',
      buttonText: 'Csevegőszoba Létrehozása',
    },

    dmWith: 'DM vele',
    newChatroom: 'Új Csevegőszoba',
    publicChatrooms: 'Nyilvános Csevegőszobák',
    xssWarning: 'Üzenet elrejtve lehetséges rosszindulatú tartalom miatt.',
    failedDecryption: 'Az üzenet visszafejtése sikertelen volt.',
    enterMessage: 'Írja be üzenetét...',
    invJoinTitle: 'Csatlakozás',
    invJoinDesc1: 'Meghívást kaptál, hogy csatlakozz a csevegőszobához:',
    invJoinDesc2: 'szeretnél csatlakozni hozzá?',
    invDecline: 'Elutasítás',
    invAccept: 'Csatlakozás',

    addChatroom: 'Csevegőszoba Hozzáadása',
    addChatroomDesc:
      'segmentben a csevegőszobák olyan helyek, ahol két vagy több ember kommunikálhat egymással.',
    addChatroomPublic: 'Nyilvános',
    addChatroomPublicDesc:
      'A nyilvános csevegőszobákban bárki részt vehet. Nagyszerű nagy közösségek számára.',
    addChatroomPrivate: 'Privát',
    addChatroomPrivateDesc:
      'A privát csevegőszobák csak meghívással elérhetőek, és nem jelennek meg sehol. Nagyszerű neked és a barátaidnak.',
    addChatroomDM: 'Közvetlen Üzenet (DM)',
    addChatroomDMDesc:
      'Végponttól végpontig titkosított kommunikáció te és a címzett között. Alkalmas bizalmas beszélgetésekhez.',

    createChatroomCreateA: 'Készítsünk egy',
    createChatroomPublic: 'Nyilvános Csevegőszobát',
    createChatroomPrivate: 'Privát Csevegőszobát',
    createChatroomDM: 'Közvetlen Üzenetet',
    createChatroomDMNote:
      'Egyelőre csak az Önnel azonos szerveren lévő felhasználókkal hozhatók létre közvetlen üzenetek.',
    createChatroomRecipient: 'Címzett',
    createChatroomNext: 'Következő',
    createChatroomCreate: 'Csevegőszoba Létrehozása',
    createChatroomIPTitle: 'Résztvevők Meghívása',
    createChatroomIPDesc:
      'Az alábbiakban megadhatja azoknak a résztvevőknek a nevét, akikkel beszélgetést szeretne folytatni (maximum 5 fő).',

    chatroomPublicTitle: 'Nyilvános Csevegőszobák',
    chatroomPublicDesc:
      'A felhasználói szerveren elérhető nyilvános szobákat az alábbiakban találja.',
    chatroomPublicNoDesc: 'Ehhez a szobához nem adtak meg leírást.',
    chatroomPublicParticipant: 'résztvevő',
    chatroomPublicParticipants: 'résztvevő',
    chatroomPublicAlreadyJoined: 'Már Csatlakoztál',
    chatroomPublicJoin: 'Csatlakozás',
    chatroomPublicNoRooms:
      'Ez a felhasználói szerver jelenleg nem ad otthont nyilvános szobáknak.',
    chatroomPublicError:
      'Hiba történt a szobák lekérdezése közben. Kérjük, próbálja meg később újra.',

    chatroomSettingsDesc:
      'A szobával kapcsolatos információkat az alábbiakban találja.',
    chatroomSettingsParticipants: 'Résztvevők',
    chatroomSettingsStatus: 'Állapot:',
    chatroomSettingsStatusParticipant: 'Résztvevő',
    chatroomSettingsStatusInvited: 'Meghívott',
    chatroomSettingsStatusUnknown: 'Ismeretlen',
    chatroomSettingsEncryptionTitle: 'Titkosítás',
    chatroomSettingsNoEncryption:
      'Nem sikerült közös titkot létrehozni, ezért a titkosítás nincs engedélyezve.',
    chatroomSettingsEncryption:
      'A közös titok létrejött. A kommunikáció titkosított.',
    chatroomSettingsCompareDesc:
      'A következő színkombinációt biztonságos csatornán keresztül (segmenten kívül) összehasonlíthatja partnerével, hogy ellenőrizze az üzenetek integritását.',
    chatroomSettingsDangerZoneTitle: 'Veszélyzóna',
    chatroomSettingsDangerZoneDescription:
      'Ha szeretnéd, bármikor elhagyhatod ezt a szobát az alábbi gombra kattintva.',
    chatroomSettingsDangerZoneWarning: 'Ezután nem fogsz tudni visszalépni.',
    chatroomSettingsDangerZoneLeave: 'Szoba Elhagyása',
  },

  errors: {
    [AuthMessages.UsernameEmpty]: 'A felhasználóneved nem lehet üres.',
    [AuthMessages.UsernameLong]: 'A felhasználóneved túl hosszú.',
    [AuthMessages.UsernameShort]: 'A felhasználóneved túl rövid.',
    [AuthMessages.UsernameText]: 'A felhasználóneved csak szöveg lehet.',
    [AuthMessages.PasswordEmpty]: 'A jelszavad nem lehet üres.',
    [AuthMessages.PasswordLong]: 'A jelszavad túl hosszú.',
    [AuthMessages.PasswordShort]: 'A jelszavad túl rövid.',
    [AuthMessages.PasswordNotStrong]: 'A jelszavad nem elég erős.',
    [AuthMessages.PasswordText]: 'A jelszavad csak szöveg lehet.',
    [AuthMessages.UsernameTaken]: 'Ez a felhasználónév már foglalt.',
    [AuthMessages.UserNotFound]: 'Ez a felhasználó nem található.',
    [AuthMessages.PasswordIncorrect]: 'A jelszavad nem helyes.',
    [AuthMessages.RegistrationDisabled]:
      'A regisztráció ki van kapcsolva ezen a felhasználói szerveren.',
  },
};

export default hu;
