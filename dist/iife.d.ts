import * as NI from './game';
declare global {
    interface Window {
        NI: typeof NI;
    }
}
