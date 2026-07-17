import { render } from '@testing-library/react';
import { AsyncFeedback } from './async-feedback';

describe('AsyncFeedback', () => {
  it('renders nothing when idle', () => {
    const { container } = render(<AsyncFeedback loading={false} error={null} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders a loading indicator with custom text', () => {
    const { getByText } = render(
      <AsyncFeedback loading error={null} loadingText="Caricamento..." />,
    );
    expect(getByText('Caricamento...')).toBeTruthy();
  });

  it('renders the error message in an alert container', () => {
    const { container } = render(
      <AsyncFeedback loading={false} error="Qualcosa e andato storto" />,
    );
    expect(container.textContent).toContain('Qualcosa e andato storto');
    expect(container.querySelector('[role="alert"]')).not.toBeNull();
  });
});
