import { render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '../../theme/theme-provider';
import { defaultTheme } from '../../theme/tokens';
import { KITCHEN_STATUS_SEQUENCE, KitchenStatus } from '../../types/order';
import { KitchenStatusStepper } from './kitchen-status-stepper';

const STEP_LABELS = ['Enviado', 'Preparo', 'Pronto', 'Entregue'] as const;

function renderStepper(status: KitchenStatus) {
  return render(
    <ThemeProvider>
      <KitchenStatusStepper status={status} />
    </ThemeProvider>,
  );
}

describe('KitchenStatusStepper', () => {
  it.each(KITCHEN_STATUS_SEQUENCE)('renders the 4 step labels for status "%s"', async (status) => {
    await renderStepper(status);
    for (const label of STEP_LABELS) {
      expect(screen.getByText(label)).toBeOnTheScreen();
    }
  });

  it('marks only the first step as reached for "queued"', async () => {
    await renderStepper('queued');
    expect(screen.getByText('Enviado')).toHaveStyle({ color: defaultTheme.colors.primary });
    expect(screen.getByText('Preparo')).toHaveStyle({ color: defaultTheme.colors.textMuted });
    expect(screen.getByText('Pronto')).toHaveStyle({ color: defaultTheme.colors.textMuted });
    expect(screen.getByText('Entregue')).toHaveStyle({ color: defaultTheme.colors.textMuted });
  });

  it('marks steps up to the current status as reached for "ready"', async () => {
    await renderStepper('ready');
    expect(screen.getByText('Enviado')).toHaveStyle({ color: defaultTheme.colors.primary });
    expect(screen.getByText('Preparo')).toHaveStyle({ color: defaultTheme.colors.primary });
    expect(screen.getByText('Pronto')).toHaveStyle({ color: defaultTheme.colors.primary });
    expect(screen.getByText('Entregue')).toHaveStyle({ color: defaultTheme.colors.textMuted });
  });

  it('marks every step as reached for "delivered"', async () => {
    await renderStepper('delivered');
    for (const label of STEP_LABELS) {
      expect(screen.getByText(label)).toHaveStyle({ color: defaultTheme.colors.primary });
    }
  });
});
