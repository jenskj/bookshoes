import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { NotFound } from './NotFound';

describe('NotFound', () => {
  it('renders fallback messaging', () => {
    const html = renderToString(
      <StaticRouter location="/missing">
        <NotFound />
      </StaticRouter>
    );

    expect(html).toContain('Page not found');
    expect(html).toContain('Go to dashboard');
  });
});
