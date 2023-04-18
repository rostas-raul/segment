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
      inputPlaceholderRoomName: 'My awesome room!',
      inputLabelRoomDescription: 'Room Description',
      inputPlaceholderRoomDescription: 'Just for me and my friends!',
      inputLabelRoomPassword: 'Room Password',
      inputPlaceholderRoomPassword: 'SuperSecretPassword1234',
      buttonText: 'Create Chatroom',
    },

    dmWith: 'DM with',
    newChatroom: 'New Chatroom',
    publicChatrooms: 'Public Chatrooms',
    xssWarning: 'Message hidden due to potentionally malicious content.',
    failedDecryption: 'Failed to decrypt this message.',
    enterMessage: 'Enter your message...',
    invJoinTitle: 'Join',
    invJoinDesc1: 'You have been invited to join the chatroom',
    invJoinDesc2: 'would you like to join it?',
    invDecline: 'Decline',
    invAccept: 'Accept',

    addChatroom: 'Add a Chatroom',
    addChatroomDesc:
      'In segment, chatrooms are spaces for two or more people to communicate with each other.',
    addChatroomPublic: 'Public',
    addChatroomPublicDesc:
      'Public chatrooms are available to everyone. Anyone can participate. Great for large communities.',
    addChatroomPrivate: 'Private',
    addChatroomPrivateDesc:
      "Private chatrooms are invite only and won't show up anywhere. Great for you and your friends.",
    addChatroomDM: 'Direct Message',
    addChatroomDMDesc:
      'End-to-end encrypted communication between you and a recipient. Great for confidential chats.',

    createChatroomCreateA: 'Create a',
    createChatroomPublic: 'Public Chatroom',
    createChatroomPrivate: 'Private Chatroom',
    createChatroomDM: 'Direct Message',
    createChatroomDMNote:
      'For now, direct messages may only be created with users on the same server as you.',
    createChatroomRecipient: 'Recipient',
    createChatroomNext: 'Next',
    createChatroomCreate: 'Create Chatroom',
    createChatroomIPTitle: 'Invite Participants',
    createChatroomIPDesc:
      'You can enter the names of participants you would like to engage in a conversation with below (maximum. 5 people).',

    chatroomPublicTitle: 'Public Chatrooms',
    chatroomPublicDesc:
      'You can find public rooms that are available on the userserver below.',
    chatroomPublicNoDesc: 'No description was specified for this room.',
    chatroomPublicParticipant: 'participant',
    chatroomPublicParticipants: 'participants',
    chatroomPublicAlreadyJoined: 'Already Joined',
    chatroomPublicJoin: 'Join',
    chatroomPublicNoRooms:
      'This userserver does not host any public rooms currently.',
    chatroomPublicError:
      'An error occured while attempting to fetch rooms. Please try again later.',

    chatroomSettingsDesc: 'You can find information about the room below.',
    chatroomSettingsParticipants: 'Participants',
    chatroomSettingsStatus: 'Status:',
    chatroomSettingsStatusParticipant: 'Participant',
    chatroomSettingsStatusInvited: 'Invited',
    chatroomSettingsStatusUnknown: 'Unknown',
    chatroomSettingsEncryptionTitle: 'Encryption',
    chatroomSettingsNoEncryption:
      'A shared secret could not be established, so encryption is not enabled.',
    chatroomSettingsEncryption:
      'A shared secret has been established. Communication is encrypted.',
    chatroomSettingsCompareDesc:
      'You can compare the following color combination to your partner over a secure channel (outside of segment) to verify the integrity of messages.',
    chatroomSettingsDangerZoneTitle: 'Danger Zone',
    chatroomSettingsDangerZoneDescription:
      "You can leave this room if you'd like anytime by clicking the button below.",
    chatroomSettingsDangerZoneWarning:
      "You won't be able to join back after this.",
    chatroomSettingsDangerZoneLeave: 'Leave Room',
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
