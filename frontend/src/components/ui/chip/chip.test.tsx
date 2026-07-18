import { fireEvent, render, screen } from '@testing-library/react-native';
import { ReactElement } from 'react';
import { ThemeProvider } from '../../../theme/theme-provider';
import { Chip } from './chip';

function renderWithTheme(ui: ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('Chip', () => {
  it('renders its label', async () => {
    await renderWithTheme(<Chip label="Ao ponto" onPress={jest.fn()} />);

    expect(screen.getByText('Ao ponto')).toBeOnTheScreen();
  });

  it('fires onPress when pressed', async () => {
    const onPress = jest.fn();
    await renderWithTheme(<Chip label="Ao ponto" onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('exposes selected accessibility state when selected', async () => {
    await renderWithTheme(<Chip label="Ao ponto" selected onPress={jest.fn()} />);

    expect(screen.getByRole('button', { selected: true })).toBeOnTheScreen();
    expect(screen.getByRole('button')).toBeSelected();
  });

  it('is not selected by default', async () => {
    await renderWithTheme(<Chip label="Ao ponto" onPress={jest.fn()} />);

    expect(screen.getByRole('button')).not.toBeSelected();
  });
});
