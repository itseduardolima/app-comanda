import { fireEvent, render, screen } from '@testing-library/react-native';
import { ReactElement } from 'react';
import { ThemeProvider } from '../../theme/theme-provider';
import { Order, OrderItem } from '../../types/order';
import { OrderCard } from './order-card';

const NOW = new Date('2026-07-18T12:00:00.000Z');

let itemSeq = 0;

function makeItem(overrides: Partial<OrderItem> = {}): OrderItem {
  itemSeq += 1;
  return {
    id: `item-${itemSeq}`,
    orderId: 'order-1',
    menuItemId: 'menu-1',
    quantity: 1,
    finalPrice: 2500,
    kitchenStatus: 'queued',
    ...overrides,
  };
}

function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'order-1',
    type: 'dine_in',
    tableId: 'table-7',
    table: { id: 'table-7', number: 7, status: 'occupied' },
    customerName: 'Ana',
    paymentStatus: 'unpaid',
    createdAt: NOW.toISOString(),
    items: [makeItem()],
    ...overrides,
  };
}

function renderWithTheme(ui: ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('OrderCard', () => {
  it('shows "Mesa NN · name" for a dine_in order with table and customer', async () => {
    await renderWithTheme(<OrderCard order={makeOrder()} now={NOW} onPress={jest.fn()} />);
    expect(screen.getByText('Mesa 07 · Ana')).toBeOnTheScreen();
  });

  it('shows only the zero-padded table when there is no customer name', async () => {
    const order = makeOrder({ customerName: null, table: { id: 't-12', number: 12, status: 'occupied' } });
    await renderWithTheme(<OrderCard order={order} now={NOW} onPress={jest.fn()} />);
    expect(screen.getByText('Mesa 12')).toBeOnTheScreen();
  });

  it('shows the "Pago" badge for a paid order', async () => {
    await renderWithTheme(
      <OrderCard order={makeOrder({ paymentStatus: 'paid' })} now={NOW} onPress={jest.fn()} />,
    );
    expect(screen.getByText('Pago')).toBeOnTheScreen();
    expect(screen.queryByText('A pagar')).toBeNull();
  });

  it('shows the "A pagar" badge for an unpaid order', async () => {
    await renderWithTheme(
      <OrderCard order={makeOrder({ paymentStatus: 'unpaid' })} now={NOW} onPress={jest.fn()} />,
    );
    expect(screen.getByText('A pagar')).toBeOnTheScreen();
    expect(screen.queryByText('Pago')).toBeNull();
  });

  it('shows the pluralized items count', async () => {
    const order = makeOrder({ items: [makeItem(), makeItem(), makeItem()] });
    await renderWithTheme(<OrderCard order={order} now={NOW} onPress={jest.fn()} />);
    expect(screen.getByText(/3 itens/)).toBeOnTheScreen();
  });

  it('shows singular "1 item" for a single item', async () => {
    const order = makeOrder({ items: [makeItem()] });
    await renderWithTheme(<OrderCard order={order} now={NOW} onPress={jest.fn()} />);
    expect(screen.getByText(/1 item(?!s)/)).toBeOnTheScreen();
  });

  it('shows the least-advanced kitchen status as the bottleneck badge (queued + ready -> "Na fila")', async () => {
    const order = makeOrder({
      items: [makeItem({ kitchenStatus: 'queued' }), makeItem({ kitchenStatus: 'ready' })],
    });
    await renderWithTheme(<OrderCard order={order} now={NOW} onPress={jest.fn()} />);
    expect(screen.getByText('Na fila')).toBeOnTheScreen();
    expect(screen.queryByText('Pronto')).toBeNull();
  });

  it('shows "Preparando" when the slowest item is preparing (preparing + delivered)', async () => {
    const order = makeOrder({
      items: [makeItem({ kitchenStatus: 'delivered' }), makeItem({ kitchenStatus: 'preparing' })],
    });
    await renderWithTheme(<OrderCard order={order} now={NOW} onPress={jest.fn()} />);
    expect(screen.getByText('Preparando')).toBeOnTheScreen();
    expect(screen.queryByText('Entregue')).toBeNull();
  });

  it('shows "Entregue" only when every item is delivered', async () => {
    const order = makeOrder({
      items: [makeItem({ kitchenStatus: 'delivered' }), makeItem({ kitchenStatus: 'delivered' })],
    });
    await renderWithTheme(<OrderCard order={order} now={NOW} onPress={jest.fn()} />);
    expect(screen.getByText('Entregue')).toBeOnTheScreen();
  });

  it('renders no kitchen badge for an order without items', async () => {
    const order = makeOrder({ items: [] });
    await renderWithTheme(<OrderCard order={order} now={NOW} onPress={jest.fn()} />);
    expect(screen.queryByText('Na fila')).toBeNull();
    expect(screen.queryByText('Preparando')).toBeNull();
    expect(screen.queryByText('Pronto')).toBeNull();
    expect(screen.queryByText('Entregue')).toBeNull();
  });

  it('fires onPress when the card is pressed', async () => {
    const onPress = jest.fn();
    await renderWithTheme(<OrderCard order={makeOrder()} now={NOW} onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
