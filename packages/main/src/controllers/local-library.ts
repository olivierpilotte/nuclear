import { inject } from 'inversify';
import { Event, IpcMessageEvent } from 'electron';

import LocalLibrary from '../services/local-library';
import { ipcController, ipcEvent } from '../utils/decorators';
import LocalLibraryDb from '../services/local-library/db';

@ipcController()
class LocalIpcCtrl {
  constructor(
    @inject(LocalLibrary) private localLibrary: LocalLibrary,
    @inject(LocalLibraryDb) private localLibraryDb: LocalLibraryDb
  ) {}
  
  @ipcEvent('get-localfolders')
  getLocalFolders(event: IpcMessageEvent) {
    event.returnValue = this.localLibraryDb.get('localFolders');
  }

  @ipcEvent('set-localfolders')
  setLocalFolders(event: IpcMessageEvent, localFolders: string[]) {
    this.localLibraryDb.set('localFolders', localFolders);
  }

  /**
   * scan local library for audio files, format and store all the metadata
   */
  @ipcEvent('refresh-localfolders')
  async onRefreshLocalFolders(event: Event) {
    try {      
      const cache = await this.localLibrary.scanFoldersAndGetMeta((scanProgress, scanTotal) => {
        event.sender.send('local-files-progress', {scanProgress, scanTotal});
      });
  
      event.sender.send('local-files', cache);
    } catch (err) {
      event.sender.send('local-files-error', err);
    }
  }
  
}

export default LocalIpcCtrl;
