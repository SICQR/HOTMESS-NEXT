import React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

describe('a11y baseline', () => {
	it('document has no obvious accessibility violations', async () => {
		const { container } = render(<main><h1>Accessibility Smoke</h1><p>Content</p></main>);
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});
});

