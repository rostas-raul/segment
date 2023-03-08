import { AuthMessages } from '@/types/Api';

const en = {
  ok: 'OK',

  auth: {
    inputLabelUsername: 'Username',
    inputLabelPassword: 'Password',
    inputPlaceholderUsername: 'Enter your username',
    inputPlaceholderPassword: 'Enter your password',

    userserverLabel: 'Connecting to userserver',

    serverNotAvailable: "This userserver doesn't seem to be available.",
    failedToUploadKeys:
      'An unknown error occured while trying to publish keys. Try again later.',

    login: {
      alternateActionPre: "Don't have an account?",
      alternateAction: 'Sign up',
      buttonText: 'Sign in',
    },
    register: {
      alternateActionPre: 'Already have an account?',
      alternateAction: 'Sign in',
      buttonText: 'Sign up',
      success: 'Successfully registered to the userserver!',
    },
  },

  chat: {
    failedToFetchRooms:
      'An unexpected error happened while trying to fetch rooms. Please try again later.',
    emptyRoom:
      'Seems like this room is empty. Be the first one to say something!',
    createChatRoom: {
      header: 'Create a Chatroom',
      inputLabelRoomName: 'Room Name',
      inputPlaceholderRoomName: 'The room name',
      inputLabelRoomDescription: 'Room Description',
      inputPlaceholderRoomDescription: 'A short description',
      inputLabelRoomPassword: 'Room Password',
      inputPlaceholderRoomPassword: 'The password others join with',
      buttonText: 'Create Chatroom',
    },
  },

  errors: {
    [AuthMessages.UsernameEmpty]: 'Your username cannot be empty.',
    [AuthMessages.UsernameLong]: 'Your username is too long.',
    [AuthMessages.UsernameShort]: 'Your username is too short.',
    [AuthMessages.UsernameText]: 'Your username must be text.',
    [AuthMessages.PasswordEmpty]: 'Your password cannot be empty.',
    [AuthMessages.PasswordLong]: 'Your password is too long.',
    [AuthMessages.PasswordShort]: 'Your password is too short.',
    [AuthMessages.PasswordNotStrong]: 'Your password is not strong enough.',
    [AuthMessages.PasswordText]: 'Your password must be text.',
    [AuthMessages.UsernameTaken]: 'That username is already taken.',
    [AuthMessages.UserNotFound]: 'That user cannot be found.',
    [AuthMessages.PasswordIncorrect]: 'Your password is incorrect.',
    [AuthMessages.RegistrationDisabled]:
      'Registration is disabled on this userserver.',
  },
};

export default en;
