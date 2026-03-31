export const FTP_STATES = {
  DISCONNECTED: 'DISCONNECTED',
  CONNECTING: 'CONNECTING',
  USER_ACK: 'USER_ACK', // Wait for PASS
  LOGGED_IN: 'LOGGED_IN',
  TRANSFERRING: 'TRANSFERRING',
};

export const RESPONSE_CODES = {
  220: 'Service ready for new user.',
  331: 'User name okay, need password.',
  230: 'User logged in, proceed.',
  150: 'File status okay; about to open data connection.',
  226: 'Closing data connection. Requested file action successful.',
  250: 'Requested file action okay, completed.',
  530: 'Not logged in.',
  425: 'Can\'t open data connection.',
  221: 'Service closing control connection.',
};

/**
 * Mocks the behavior of an FTP server.
 */
export class FTPServer {
  constructor() {
    this.files = [
      { name: 'rfc959.pdf', size: '150KB', type: 'doc' },
      { name: 'network-map.png', size: '1.2MB', type: 'img' },
      { name: 'config.json', size: '4KB', type: 'file' },
      { name: 'log.txt', size: '12KB', type: 'file' },
    ];
    this.user = 'admin';
    this.pass = 'password123';
  }

  processCommand(cmd, arg, state) {
    switch (cmd.toUpperCase()) {
      case 'USER':
        if (arg === this.user) return { code: 331, nextState: FTP_STATES.USER_ACK };
        return { code: 530, nextState: FTP_STATES.DISCONNECTED };

      case 'PASS':
        if (state === FTP_STATES.USER_ACK && arg === this.pass) {
          return { code: 230, nextState: FTP_STATES.LOGGED_IN };
        }
        return { code: 530, nextState: FTP_STATES.DISCONNECTED };

      case 'LIST':
        if (state !== FTP_STATES.LOGGED_IN) return { code: 530 };
        return { code: 150, data: this.files, then: 226 };

      case 'RETR':
        if (state !== FTP_STATES.LOGGED_IN) return { code: 530 };
        const file = this.files.find(f => f.name === arg);
        if (file) return { code: 150, file, then: 226 };
        return { code: 550 };

      case 'QUIT':
        return { code: 221, nextState: FTP_STATES.DISCONNECTED };

      default:
        return { code: 500, message: 'Command not understood.' };
    }
  }
}

export const INITIAL_FILES = [
  { name: 'local-file.txt', size: '2KB', type: 'file' },
  { name: 'notes.md', size: '5KB', type: 'file' },
];
