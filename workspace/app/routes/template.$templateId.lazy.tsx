import { useMemo, useState } from 'react';
import { Form, useLoaderData, useNavigation } from 'react-router';

import { Button } from '../_core/button';
import { Container } from '../_core/container';
import { MEME_IMAGE_EXTENSIONS, MEMEGEN_BASE_URL } from '../_core/memegen';
import type { loader } from './template.$templateId';
import * as css from './template.$templateId.lazy.module.css';

export function Component() {
  const navigation = useNavigation();
  const { csrfToken, template } = useLoaderData<typeof loader>();
  const [extension, setExtension] = useState('jpg');
  const [text, setText] = useState(template.example.text);

  const encodedTextPart = useMemo(
    () =>
      text
        .map(line =>
          (line || ' ')
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
            .replace(/"/g, "''"),
        )
        .join('/'),
    [text],
  );

  const urlStr = useMemo(() => {
    const url = new URL(
      `/images/${template.id}/${encodedTextPart}.${extension}`,
      MEMEGEN_BASE_URL,
    );

    url.searchParams.set('width', String(640));

    return url.toString();
  }, [encodedTextPart, extension, template.id]);

  return (
    <Container>
      <title>{template.name}</title>
      <h1>{template.name}</h1>

      <p>
        <a href={template.source} rel="noopener" target="_blank">
          More info about this meme
        </a>
      </p>

      <div className={css.imageAndForm}>
        <img
          className={css.image}
          src={urlStr}
          alt=""
          decoding="async"
          loading="lazy"
        />

        <Form method="post" className={css.form}>
          <input type="hidden" name="csrf_token" value={csrfToken} />

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
                      prevState.map((l, i) => (i === index ? newValue : l)),
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
              disabled={navigation.state === 'submitting'}
              id="extension"
              name="extension"
              value={extension}
              onChange={event => {
                setExtension(event.currentTarget.value);
              }}
            >
              {MEME_IMAGE_EXTENSIONS.map(ext => (
                <option key={ext}>{ext}</option>
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
