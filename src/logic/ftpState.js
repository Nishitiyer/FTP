export const FTP_STAGES = {
  IDLE: 'IDLE',
  HOST_SELECTED: 'HOST_SELECTED',
  CONNECTED: 'CONNECTED',
  AUTH_PENDING: 'AUTH_PENDING',
  AUTHENTICATED: 'AUTHENTICATED',
  NEGOTIATING: 'NEGOTIATING',
  TRANSFERRING: 'TRANSFERRING',
  COMPLETE: 'COMPLETE'
};

export const INITIAL_FILES = [
  { name: 'image_108.jpg', size: '4.2 MB', color: '#6fd7ff', type: 'IMAGE' },
  { name: 'backup.zip', size: '18.7 MB', color: '#c58cff', type: 'ARCHIVE' },
  { name: 'logs.tar', size: '7.9 MB', color: '#ff9b7a', type: 'LOG' },
  { name: 'report.pdf', size: '2.1 MB', color: '#ffd86c', type: 'DOC' },
];

export const RESPONSE_CODES = {
  220: 'Service ready for new user.',
  221: 'Service closing control connection.',
  226: 'Closing data connection. Transfer complete.',
  230: 'User logged in, proceed.',
  331: 'User name okay, need password.',
  150: 'File status okay; about to open data connection.'
};
