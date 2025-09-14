import icon192 from '../icon-192.png';
import icon512 from '../icon-512.png';

export const loader =
  __ENTRY_TARGET__ === 'node'
    ? async () => {
        return new Response(
          JSON.stringify({
            name: 'Memes',
            short_name: 'Memes',
            description: 'Generate memes from provided templates',
            theme_color: 'hsl(270 50% 40%)',
            background_color: 'hsl(270 50% 40%)',
            start_url: '/',
            id: '/',
            display: 'minimal-ui',
            icons: [
              {
                src: icon192,
                type: 'image/png',
                sizes: '192x192',
                purpose: 'maskable any',
              },
              {
                src: icon512,
                type: 'image/png',
                sizes: '512x512',
                purpose: 'maskable any',
              },
            ],
          }),
          { headers: { 'content-type': 'application/manifest+json' } },
        );
      }
    : undefined;
