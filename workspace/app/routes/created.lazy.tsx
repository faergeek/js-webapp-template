import { useEffect, useMemo, useState } from 'react';
import { useLoaderData } from 'react-router';

import { Button } from '../_core/button';
import { Container } from '../_core/container';
import type { loader } from './created';
import * as css from './created.lazy.module.css';

export function Component() {
  const { templateId, text, url } = useLoaderData<typeof loader>();
  const shareData: ShareData = useMemo(() => ({ url }), [url]);
  const [isShareSupported, setIsShareSupported] = useState<boolean>();

  useEffect(() => {
    setIsShareSupported(
      typeof navigator.canShare === 'function' &&
        typeof navigator.share === 'function' &&
        navigator.canShare(shareData),
    );
  }, [shareData]);

  const telegramShareUrl = new URL('https://t.me/share/url');
  telegramShareUrl.searchParams.set('url', url);

  const twitterShareUrl = new URL('https://twitter.com/intent/tweet');
  twitterShareUrl.searchParams.set('url', url);

  return (
    <Container>
      <title>You successfully created your own meme!!!</title>
      <h1>You successfully created your own meme!!!</h1>

      <div className={css.imageWrapper}>
        <img src={url} alt="Your new meme" />
      </div>

      <p className={css.share}>
        <span>Go ahead and share it:</span>

        <span className={css.shareButtons}>
          <Button
            as="a"
            download
            href={telegramShareUrl.toString()}
            rel="noopener"
            target="_blank"
          >
            Telegram
          </Button>

          <Button
            as="a"
            download
            href={twitterShareUrl.toString()}
            rel="noopener"
            target="_blank"
          >
            Twitter
          </Button>

          {isShareSupported && (
            <Button
              onClick={() => {
                navigator.share(shareData);
              }}
            >
              More
            </Button>
          )}

          <Button
            as="a"
            download={`${templateId}${text.length === 0 ? '' : ` (${text.join(', ')})`}.${url.split('.').at(-1)}`}
            href={`/download?${new URLSearchParams({ url })}`}
            rel="noopener"
            target="_blank"
          >
            Download
          </Button>
        </span>
      </p>
    </Container>
  );
}
