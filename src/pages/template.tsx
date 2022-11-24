import { useState } from 'react';
import {
  ActionFunctionArgs,
  Form,
  LoaderFunctionArgs,
  redirect,
  useLoaderData,
  useNavigation,
} from 'react-router-dom';
import invariant from 'tiny-invariant';

import { Button } from '../_core/button';
import { MetaFunctionArgs } from '../_core/meta';
import {
  createMeme,
  fetchTemplateById,
  getPreviewImageUrl,
  MEME_IMAGE_EXTENSIONS,
  MemeImageExtension,
} from '../api';
import { Container } from '../layout/layout';
import * as css from './template.module.css';

export function templateLoader({ params }: LoaderFunctionArgs) {
  invariant(params.templateId);

  return fetchTemplateById(params.templateId);
}

type LoaderData = Awaited<ReturnType<typeof templateLoader>>;

export function templateMeta({ data }: MetaFunctionArgs<LoaderData>) {
  const imageUrl = new URL(data.example.url);
  imageUrl.searchParams.set('width', '1200');
  imageUrl.searchParams.set('height', '630');

  return {
    'og:image': imageUrl.toString(),
    title: data.name,
  };
}

export async function templateAction({ params, request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const extensionData = formData.get('extension');
  const textData = formData.getAll('text');

  invariant(
    MEME_IMAGE_EXTENSIONS.includes(extensionData as MemeImageExtension)
  );
  const extension = extensionData as MemeImageExtension;

  const text = textData.filter(
    (item): item is string => typeof item === 'string'
  );

  invariant(params.templateId);
  const { url } = await createMeme(params.templateId, { extension, text });

  const searchParams = new URLSearchParams();
  searchParams.set('url', url);

  return redirect(`/created?${searchParams}`);
}

export function TemplatePage() {
  const navigation = useNavigation();
  const template = useLoaderData() as LoaderData;
  const [text, setText] = useState(template.example.text);

  return (
    <Container>
      <h1>{template.name}</h1>

      <p>
        <a href={template.source} rel="noopener" target="_blank">
          More info about this meme
        </a>
      </p>

      <div className={css.imageAndForm}>
        <img
          className={css.image}
          src={getPreviewImageUrl(template, text).toString()}
          alt=""
          decoding="async"
          loading="lazy"
        />

        <Form method="post" className={css.form}>
          {text.map((line, index) => {
            const id = `text-input-${index}`;

            return (
              <div key={index}>
                <label className={css.fieldLabel} htmlFor={id}>
                  Line {index}
                </label>

                <textarea
                  className={css.textInput}
                  disabled={navigation.state === 'submitting'}
                  id={id}
                  name="text"
                  rows={3}
                  value={line}
                  onChange={event => {
                    const newValue = event.currentTarget.value;

                    setText(prevState =>
                      prevState.map((l, i) => (i === index ? newValue : l))
                    );
                  }}
                />
              </div>
            );
          })}

          <div>
            <label className={css.fieldLabel} htmlFor="extension">
              Extension
            </label>

            <select
              className={css.select}
              defaultValue="jpg"
              disabled={navigation.state === 'submitting'}
              id="extension"
              name="extension"
            >
              {MEME_IMAGE_EXTENSIONS.map(extension => (
                <option key={extension}>{extension}</option>
              ))}
            </select>
          </div>

          <Button disabled={navigation.state === 'submitting'} type="submit">
            Generate
          </Button>
        </Form>
      </div>
    </Container>
  );
}
