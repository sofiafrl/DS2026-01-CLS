import { MusicService } from './MusicService.js';
import { AppUI } from './AppUI.js';

const musicService = new MusicService();
const appUI = new AppUI(musicService);

appUI.initialize();
