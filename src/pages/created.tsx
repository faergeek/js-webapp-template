import { useEffect, useMemo, useState } from 'react';
import type { LoaderFunctionArgs } from 'react-router';
import { redirect, useLoaderData } from 'react-router';

import { Button } from '../_core/button';
import type { MetaDescriptor } from '../_core/meta';
import { Container } from '../layout/layout';
import * as css from './created.module.css';

export function createdLoader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const urlParam = url.searchParams.get('url');

  if (!urlParam) {
    throw redirect('/');
  }

  return {
    url: urlParam,
  };
}

type LoaderData = Awaited<ReturnType<typeof createdLoader>>;

export const createdMeta: MetaDescriptor = {
  'og:title': 'You successfully created your own meme!!!',
  title: 'You successfully created your own meme!!!',
};

export function CreatedPage() {
  const { url } = useLoaderData() as LoaderData;
  const [isShareSupported, setIsShareSupported] = useState<boolean>();

  const shareData: ShareData = useMemo(
    () => ({
      url,
    }),
    [url],
  );

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
            download={`meme.${url.split('.').at(-1)}`}
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
