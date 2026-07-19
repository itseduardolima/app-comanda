import { act, fireEvent, render, screen } from '@testing-library/react-native';

/**
 * expo-router pulls in ESM-only navigation internals that jest-expo does not
 * transform, so the router surface used by the screen is mocked wholesale.
 * `useFocusEffect` is modelled faithfully: the effect runs on mount and again
 * every time the screen is told it regained focus — without remounting it,
 * which is exactly the situation "Trocar usuário" creates on screen 00B.
 */
const mockPush = jest.fn();
const mockFocusEffects = new Set<() => void>();

jest.mock('expo-router', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useEffect } = require('react') as typeof import('react');
  return {
    useRouter: () => ({ push: mockPush }),
    useFocusEffect: (effect: () => void) => {
      useEffect(() => {
        effect();
        mockFocusEffects.add(effect);
        return () => {
          mockFocusEffects.delete(effect);
        };
      }, [effect]);
    },
  };
});

const mockLogin = jest.fn();
jest.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({ login: mockLogin }),
}));

// Imported after the mocks it depends on, for readability (babel hoists both).
// eslint-disable-next-line import/first
import LoginScreen from '../app/(auth)/login';

/** Simulates the Login screen regaining focus (pop back from screen 00B). */
async function refocus() {
  await act(async () => {
    mockFocusEffects.forEach((effect) => effect());
  });
}

function usernameValue() {
  return screen.getByTestId('username-input').props.value;
}

async function typeUsername(value: string) {
  await act(async () => {
    fireEvent.changeText(screen.getByTestId('username-input'), value);
  });
}

describe('LoginScreen — switch user (HU-17)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFocusEffects.clear();
  });

  it('starts empty and keeps what the operator types while the screen is in use', async () => {
    await render(<LoginScreen />);
    expect(usernameValue()).toBe('');

    await typeUsername('joana');
    expect(usernameValue()).toBe('joana');
  });

  it('discards the previous operator username when Login regains focus', async () => {
    await render(<LoginScreen />);
    await typeUsername('joana');
    expect(usernameValue()).toBe('joana');

    await refocus();

    expect(usernameValue()).toBe('');
  });

  it('clears the error left by a failed attempt when Login regains focus', async () => {
    mockLogin.mockRejectedValue(new Error('boom'));
    await render(<LoginScreen />);
    await typeUsername('joana');

    await act(async () => {
      fireEvent.press(screen.getByText('Continuar'));
    });
    expect(screen.queryByText('Algo deu errado. Tente novamente.')).toBeTruthy();

    await refocus();

    expect(screen.queryByText('Algo deu errado. Tente novamente.')).toBeNull();
  });

  it('still routes to pin-verify on a normal attempt', async () => {
    mockLogin.mockResolvedValue({ operatorId: 'op-1', pinSet: true });
    await render(<LoginScreen />);
    await typeUsername('Joana');

    await act(async () => {
      fireEvent.press(screen.getByText('Continuar'));
    });

    expect(mockLogin).toHaveBeenCalledWith('joana');
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/(auth)/pin-verify',
      params: { operatorId: 'op-1', username: 'joana' },
    });
  });
});
