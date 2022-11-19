import { useEffect, useMemo, useState } from 'react';
import { LoaderFunctionArgs, redirect, useLoaderData } from 'react-router-dom';

import { Button } from '../_core/button';
import { MetaDescriptor } from '../_core/meta';
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
  title: 'You successfully created your own meme!!!',
};

export function CreatedPage() {
  const { url } = useLoaderData() as LoaderData;
  const [isShareSupported, setIsShareSupported] = useState<boolean>();

  const shareData: ShareData = useMemo(
    () => ({
      url,
    }),
    [url]
  );

  useEffect(() => {
    setIsShareSupported(
      typeof navigator.canShare === 'function' &&
        typeof navigator.share === 'function' &&
        navigator.canShare(shareData)
    );
  }, [shareData]);

  const telegramShareUrl = new URL('https://t.me/share/url');
  telegramShareUrl.searchParams.set('url', url);

  const twitterShareUrl = new URL('https://twitter.com/intent/tweet');
  twitterShareUrl.searchParams.set('url', url);

  return (
    <Container>
      <h1>You successfully created your own meme!!!</h1>

      <p className={css.share}>
        <span>Share:</span>

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
          download="meme.jpg"
          href={`/download?${new URLSearchParams({ url })}`}
          rel="noopener"
          target="_blank"
        >
          Download
        </Button>
      </p>

      <div className={css.imageWrapper}>
        <img src={url} alt="Your new meme" />
      </div>
    </Container>
  );
}
