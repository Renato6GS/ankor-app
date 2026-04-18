"use client";
import { useEffect, useState } from "react";
import {
  Badge,
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
import { getClientSession } from "../../lib/session";

type User = {
  id: number;
  email: string;
  name: string;
  role: string;
  address: string | null;
  phone: string | null;
};

type Order = {
  id: number;
  userId: number;
  total: number;
  status: string;
  createdAt: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getClientSession();
    if (!session) {
      router.push("/login");
      return;
    }
    // V6 (visible aquí): traemos /api/users (todos) y filtramos en cliente.
    // En la mitigación habrá GET /api/users/me que devuelva solo el actual.
    Promise.all([
      fetch("/api/users").then((r) => r.json()),
      fetch("/api/orders").then((r) => r.json()),
    ]).then(([users, allOrders]) => {
      setUser(users.find((u: User) => u.id === session.userId) ?? null);
      setOrders(
        allOrders.filter((o: Order) => o.userId === session.userId),
      );
      setLoading(false);
    });
  }, [router]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  if (loading) {
    return (
      <Container my="xl">
        <Text>Cargando...</Text>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container my="xl">
        <Text>Usuario no encontrado.</Text>
      </Container>
    );
  }

  return (
    <Container size="md" my="xl">
      <Group justify="space-between" mb="md">
        <Title order={2}>Mi perfil</Title>
        <Button variant="light" color="red" onClick={logout}>
          Cerrar sesión
        </Button>
      </Group>
      <Paper withBorder p="md" radius="md" mb="lg">
        <Stack gap="xs">
          <Text>
            <b>Nombre:</b> {user.name}
          </Text>
          <Text>
            <b>Email:</b> {user.email}
          </Text>
          <Text>
            <b>Rol:</b> <Badge component="span">{user.role}</Badge>
          </Text>
          <Text>
            <b>Dirección:</b> {user.address ?? "—"}
          </Text>
          <Text>
            <b>Teléfono:</b> {user.phone ?? "—"}
          </Text>
        </Stack>
      </Paper>

      <Title order={3} mb="sm">
        Mis pedidos
      </Title>
      <Paper withBorder p="md" radius="md">
        {orders.length === 0 ? (
          <Text c="dimmed">No tienes pedidos aún.</Text>
        ) : (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>#</Table.Th>
                <Table.Th>Fecha</Table.Th>
                <Table.Th>Total</Table.Th>
                <Table.Th>Estado</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {orders.map((order) => (
                <Table.Tr key={order.id}>
                  <Table.Td>{order.id}</Table.Td>
                  <Table.Td>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </Table.Td>
                  <Table.Td>
                    <NumberFormatter
                      value={order.total}
                      prefix="Q"
                      decimalScale={2}
                    />
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light">{order.status}</Badge>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Paper>
    </Container>
  );
}
