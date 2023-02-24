import { AuthMessages } from '@/types/Api';

const en = {
  ok: 'OK',

  auth: {
    inputLabelUsername: 'Felhasználónév',
    inputLabelPassword: 'Jelszó',
    inputPlaceholderUsername: 'Írd be a felhasználóneved',
    inputPlaceholderPassword: 'Írd be a jelszavadat',

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

export default en;
