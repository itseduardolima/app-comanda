import { fireEvent, render, screen } from '@testing-library/react-native';
import { useState } from 'react';
import { ThemeProvider } from '../../theme/theme-provider';
import { PinInput } from './pin-input';

/** Controlled harness mirroring how screens use PinInput (value held in state). */
function Harness({ onComplete }: { onComplete?: (pin: string) => void }) {
  const [value, setValue] = useState('');
  return (
    <ThemeProvider>
      <PinInput value={value} onChange={setValue} onComplete={onComplete} />
    </ThemeProvider>
  );
}

/** Presses the on-screen keypad key labelled with the given digit. */
function pressKey(digit: string) {
  return fireEvent.press(screen.getByLabelText(digit));
}

function pressBackspace() {
  return fireEvent.press(screen.getByLabelText('backspace'));
}

function dotCounts() {
  return {
    filled: screen.queryAllByTestId('pin-dot-filled').length,
    empty: screen.queryAllByTestId('pin-dot-empty').length,
  };
}

describe('PinInput', () => {
  it('calls onComplete exactly once with the pin after the 4th digit', async () => {
    const onComplete = jest.fn();
    await render(<Harness onComplete={onComplete} />);

    await pressKey('4');
    await pressKey('9');
    await pressKey('0');
    expect(onComplete).not.toHaveBeenCalled();

    await pressKey('2');
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith('4902');
  });

  it('ignores a 5th key press and does not fire onComplete again', async () => {
    const onComplete = jest.fn();
    await render(<Harness onComplete={onComplete} />);

    for (const digit of ['1', '2', '3', '4']) {
      await pressKey(digit);
    }
    expect(onComplete).toHaveBeenCalledTimes(1);

    await pressKey('5');
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith('1234');
    expect(dotCounts()).toEqual({ filled: 4, empty: 0 });
  });

  it('does not report a change once the pin is full', async () => {
    const onChange = jest.fn();
    await render(
      <ThemeProvider>
        <PinInput value="1234" onChange={onChange} />
      </ThemeProvider>,
    );
    await pressKey('5');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('removes the last digit on backspace', async () => {
    const onChange = jest.fn();
    await render(
      <ThemeProvider>
        <PinInput value="123" onChange={onChange} />
      </ThemeProvider>,
    );
    await pressBackspace();
    expect(onChange).toHaveBeenCalledWith('12');
  });

  it('ignores backspace when the pin is empty', async () => {
    const onChange = jest.fn();
    await render(
      <ThemeProvider>
        <PinInput value="" onChange={onChange} />
      </ThemeProvider>,
    );
    await pressBackspace();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('fills one dot per typed digit and never shows the digits themselves', async () => {
    const onComplete = jest.fn();
    await render(<Harness onComplete={onComplete} />);
    expect(dotCounts()).toEqual({ filled: 0, empty: 4 });

    await pressKey('1');
    await pressKey('2');
    expect(dotCounts()).toEqual({ filled: 2, empty: 2 });

    await pressBackspace();
    expect(dotCounts()).toEqual({ filled: 1, empty: 3 });
  });

  it('renders the left action key and fires it without touching the pin', async () => {
    const onPress = jest.fn();
    const onChange = jest.fn();
    await render(
      <ThemeProvider>
        <PinInput value="1" onChange={onChange} leftAction={{ label: 'Trocar', onPress }} />
      </ThemeProvider>,
    );
    await fireEvent.press(screen.getByText('Trocar'));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();
  });
});
