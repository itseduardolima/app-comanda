import { fireEvent, render, screen } from '@testing-library/react-native';
import { ReactElement } from 'react';
import { ThemeProvider } from '../../../theme/theme-provider';
import { Button } from './button';

function renderWithTheme(ui: ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

function queryActivityIndicators() {
  return screen.root!.queryAll((node) => node.type === 'ActivityIndicator', {
    includeSelf: true,
  });
}

describe('Button', () => {
  it('renders its label', async () => {
    await renderWithTheme(<Button onPress={jest.fn()}>Salvar</Button>);

    expect(screen.getByText('Salvar')).toBeOnTheScreen();
    expect(screen.getByRole('button')).toBeOnTheScreen();
  });

  it('fires onPress when pressed', async () => {
    const onPress = jest.fn();
    await renderWithTheme(<Button onPress={onPress}>Salvar</Button>);

    await fireEvent.press(screen.getByRole('button'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire onPress when disabled', async () => {
    const onPress = jest.fn();
    await renderWithTheme(
      <Button onPress={onPress} disabled>
        Salvar
      </Button>,
    );

    await fireEvent.press(screen.getByRole('button'));

    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows an ActivityIndicator instead of the label when loading', async () => {
    await renderWithTheme(
      <Button onPress={jest.fn()} loading>
        Salvar
      </Button>,
    );

    expect(queryActivityIndicators()).toHaveLength(1);
    expect(screen.queryByText('Salvar')).not.toBeOnTheScreen();
  });

  it('does not fire onPress when loading', async () => {
    const onPress = jest.fn();
    await renderWithTheme(
      <Button onPress={onPress} loading>
        Salvar
      </Button>,
    );

    await fireEvent.press(screen.getByRole('button'));

    expect(onPress).not.toHaveBeenCalled();
  });
});
