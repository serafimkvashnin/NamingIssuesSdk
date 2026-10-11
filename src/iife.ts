// Сборка для подключения обычным <script> (Unity WebGL, Phaser без бандлера): всё API в window.NI
import * as NI from './game'

declare global {
  interface Window {
    NI: typeof NI
  }
}

window.NI = NI
