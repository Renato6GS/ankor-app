"use client";
import { useState } from "react";
import {
  Alert,
  Button,
  Container,
  Group,
  NumberFormatter,
  Paper,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import { useCart } from "../../lib/cart";
import { getClientSession } from "../../lib/session";

export default function CartPage() {
  const router = useRouter();
  const cart = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmar() {
    setError(null);
    const session = getClientSession();
    if (!session) {
      router.push("/login");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: session.userId,
        items: cart.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      }),
    });
    setSubmitting(false);
    if (!res.ok) {
      setError("No se pudo confirmar el pedido");
      return;
    }
    cart.clear();
    router.push("/profile");
  }

  return (
    <Container size="md" my="xl">
      <Title order={2} mb="md">
        Carrito
      </Title>
      <Paper withBorder p="md" radius="md">
        {cart.items.length === 0 ? (
          <Text c="dimmed">Tu carrito está vacío.</Text>
        ) : (
          <Stack>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Producto</Table.Th>
                  <Table.Th>Cantidad</Table.Th>
                  <Table.Th>Precio</Table.Th>
                  <Table.Th>Subtotal</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {cart.items.map((item) => (
                  <Table.Tr key={item.productId}>
                    <Table.Td>{item.name}</Table.Td>
                    <Table.Td>{item.quantity}</Table.Td>
                    <Table.Td>
                      <NumberFormatter
                        value={item.price}
                        prefix="Q"
                        decimalScale={2}
                      />
                    </Table.Td>
                    <Table.Td>
                      <NumberFormatter
                        value={item.price * item.quantity}
                        prefix="Q"
                        decimalScale={2}
                      />
                    </Table.Td>
                    <Table.Td>
                      <Button
                        size="xs"
                        variant="subtle"
                        color="red"
                        onClick={() => cart.remove(item.productId)}
                      >
                        Quitar
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
            <Group justify="space-between">
              <Text fw={700}>
                Total:{" "}
                <NumberFormatter
                  value={cart.total}
                  prefix="Q"
                  decimalScale={2}
                />
              </Text>
              <Button onClick={confirmar} loading={submitting}>
                Confirmar pedido
              </Button>
            </Group>
            {error && <Alert color="red">{error}</Alert>}
          </Stack>
        )}
      </Paper>
    </Container>
  );
}
