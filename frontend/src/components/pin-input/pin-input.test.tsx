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

function typeOnHiddenInput(text: string) {
  return fireEvent.changeText(screen.getByTestId('pin-hidden-input'), text);
}

describe('PinInput', () => {
  it('calls onComplete exactly once with the pin after the 4th digit', async () => {
    const onComplete = jest.fn();
    await render(<Harness onComplete={onComplete} />);

    await typeOnHiddenInput('4');
    await typeOnHiddenInput('49');
    await typeOnHiddenInput('490');
    expect(onComplete).not.toHaveBeenCalled();

    await typeOnHiddenInput('4902');
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith('4902');
  });

  it('strips non-digit characters before reporting the value', async () => {
    const onChange = jest.fn();
    await render(
      <ThemeProvider>
        <PinInput value="" onChange={onChange} />
      </ThemeProvider>,
    );

    await typeOnHiddenInput('a1!b2·');
    expect(onChange).toHaveBeenCalledWith('12');
  });

  it('completes with only the first 4 digits when extra characters sneak in', async () => {
    const onChange = jest.fn();
    const onComplete = jest.fn();
    await render(
      <ThemeProvider>
        <PinInput value="" onChange={onChange} onComplete={onComplete} />
      </ThemeProvider>,
    );

    await typeOnHiddenInput('1a2b3c4d5');
    expect(onChange).toHaveBeenCalledWith('1234');
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith('1234');
  });

  it('masks the typed value as one dot per digit', async () => {
    await render(
      <ThemeProvider>
        <PinInput value="12" onChange={jest.fn()} />
      </ThemeProvider>,
    );
    expect(screen.getAllByText('•')).toHaveLength(2);
    expect(screen.queryByText('1')).toBeNull();
    expect(screen.queryByText('2')).toBeNull();
  });

  it('shows 4 dots (one per box) when the pin is full', async () => {
    await render(
      <ThemeProvider>
        <PinInput value="1234" onChange={jest.fn()} />
      </ThemeProvider>,
    );
    expect(screen.getAllByText('•')).toHaveLength(4);
  });

  it('renders no dots when empty', async () => {
    await render(
      <ThemeProvider>
        <PinInput value="" onChange={jest.fn()} />
      </ThemeProvider>,
    );
    expect(screen.queryAllByText('•')).toHaveLength(0);
  });
});
