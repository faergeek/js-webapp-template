import { handleFetchError } from './_core/fetch';

const BASE_URL = 'https://api.memegen.link';

interface MemeTemplateExample {
  text: string[];
  url: string;
}

export interface MemeTemplate {
  _self: string;
  blank: string;
  example: MemeTemplateExample;
  id: string;
  lines: number;
  name: string;
  overlays: number;
  source: string;
  styles: string[];
}

export async function fetchTemplates(filter?: string | null) {
  const url = new URL('/templates', BASE_URL);

  if (filter) {
    url.searchParams.set('filter', filter);
  }

  const response = await fetch(url).catch(handleFetchError);

  if (!response.ok) {
    throw response;
  }

  const json: MemeTemplate[] = await response.json();

  return json;
}

export async function fetchTemplateById(templateId: string) {
  const response = await fetch(
    new URL(`/templates/${templateId}`, BASE_URL),
  ).catch(handleFetchError);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Response("Sorry, this meme template doesn't seem to exist.", {
        status: response.status,
        statusText: response.statusText,
      });
    }

    throw response;
  }

  const json: MemeTemplate = await response.json();

  return json;
}

export const MEME_IMAGE_EXTENSIONS = ['gif', 'jpg', 'png'] as const;
export type MemeImageExtension = (typeof MEME_IMAGE_EXTENSIONS)[number];

interface CreateMemeParams {
  extension: MemeImageExtension;
  text: string[];
}

interface CreateMemeResponse {
  url: string;
}

export async function createMeme(
  templateId: string,
  { extension, text }: CreateMemeParams,
) {
  const response = await fetch(new URL(`/templates/${templateId}`, BASE_URL), {
    method: 'post',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ extension, text }),
  }).catch(handleFetchError);

  if (!response.ok) {
    throw response;
  }

  const json: CreateMemeResponse = await response.json();

  return json;
}

function encodeTextForUrl(text: string) {
  return (text || ' ')
    .replace(/-/g, '--')
    .replace(/_/g, '__')
    .replace(/ /g, '_')
    .replace(/\n/g, '~n')
    .replace(/\?/g, '~q')
    .replace(/&/g, '~a')
    .replace(/%/g, '~p')
    .replace(/#/g, '~h')
    .replace(/\//g, '~s')
    .replace(/\\/g, '~b')
    .replace(/</g, '~l')
    .replace(/>/g, '~g')
    .replace(/"/g, "''");
}

interface GetTemplateImageUrlParams {
  extension?: MemeImageExtension;
  width?: number;
  height?: number;
}

export function getTemplateImageUrl(
  template: MemeTemplate,
  { extension = 'jpg', width, height }: GetTemplateImageUrlParams = {},
) {
  const url = new URL(
    `/images/${template.id}/${template.example.text
      .map(encodeTextForUrl)
      .join('/')}.${extension}`,
    BASE_URL,
  );

  if (width != null) {
    url.searchParams.set('width', String(width));
  }

  if (height != null) {
    url.searchParams.set('height', String(height));
  }

  return url;
}

export function getPreviewImageUrl(template: MemeTemplate, text: string[]) {
  const url = new URL('/images/preview.jpg', BASE_URL);

  url.searchParams.set('template', template.id);

  text.forEach(line => {
    url.searchParams.append('lines[]', line || ' ');
  });

  return url;
}
