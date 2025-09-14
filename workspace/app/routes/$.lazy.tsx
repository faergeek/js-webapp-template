import { Container } from '../_core/container';

export function Component() {
  const heading = 'Page Not Found';

  return (
    <Container>
      <title>{heading}</title>
      <h1>{heading}</h1>

      <p>The page you&apos;re looking for doesn&apos;t exist.</p>
    </Container>
  );
}
