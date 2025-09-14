export const MEMEGEN_BASE_URL = 'https://api.memegen.link';

export interface MemeTemplate {
  _self: string;
  blank: string;
  example: {
    text: string[];
    url: string;
  };
  id: string;
  lines: number;
  name: string;
  overlays: number;
  source: string;
  styles: string[];
}

export const MEME_IMAGE_EXTENSIONS = ['gif', 'jpg', 'png'];
