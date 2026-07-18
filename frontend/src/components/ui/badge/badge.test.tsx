import { render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '../../../theme/theme-provider';
import { Badge, BadgeVariant } from './badge';

const CASES: [BadgeVariant, string][] = [
  ['paid', 'Pago'],
  ['unpaid', 'A pagar'],
  ['queued', 'Na fila'],
  ['preparing', 'Preparando'],
  ['ready', 'Pronto'],
  ['delivered', 'Entregue'],
];

describe('Badge', () => {
  it.each(CASES)('variant "%s" renders the glossary label "%s"', async (variant, label) => {
    await render(
      <ThemeProvider>
        <Badge variant={variant} />
      </ThemeProvider>,
    );

    expect(screen.getByText(label)).toBeOnTheScreen();
  });
});
