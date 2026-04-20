"use client";
import { useEffect, useState } from "react";
import {
  Badge,
  Card,
  Container,
  Group,
  NumberFormatter,
  Paper,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";

type User = {
  id: number;
  email: string;
  name: string;
  role: string;
  address: string | null;
  phone: string | null;
};

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: { name: string };
};

type Order = {
  id: number;
  total: number;
  status: string;
  createdAt: string;
  user: { email: string; name: string };
};

type Stats = {
  totalUsers: number;
  totalOrders: number;
  ingresos: number;
};

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/users").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/orders").then((r) => r.json()),
      fetch("/api/admin").then((r) => r.json()),
    ]).then(([u, p, o, s]) => {
      setUsers(u);
      setProducts(p);
      setOrders(o);
      setStats(s);
    });
  }, []);

  return (
    <Container size="xl" my="xl">
      <Title order={2} mb="md">
        Panel de administración
      </Title>

      {stats && (
        <SimpleGrid cols={{ base: 1, sm: 3 }} mb="lg">
          <Card withBorder>
            <Text c="dimmed">Usuarios</Text>
            <Title order={3}>{stats.totalUsers}</Title>
          </Card>
          <Card withBorder>
            <Text c="dimmed">Pedidos</Text>
            <Title order={3}>{stats.totalOrders}</Title>
          </Card>
          <Card withBorder>
            <Text c="dimmed">Ingresos</Text>
            <Title order={3}>
              <NumberFormatter
                value={stats.ingresos}
                prefix="Q"
                decimalScale={2}
              />
            </Title>
          </Card>
        </SimpleGrid>
      )}

      <Stack gap="lg">
        <Paper withBorder p="md" radius="md">
          <Group justify="space-between" mb="sm">
            <Title order={4}>Usuarios</Title>
            <Badge color="blue">solo admins</Badge>
          </Group>
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>ID</Table.Th>
                <Table.Th>Nombre</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Rol</Table.Th>
                <Table.Th>Dirección</Table.Th>
                <Table.Th>Teléfono</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {users.map((u) => (
                <Table.Tr key={u.id}>
                  <Table.Td>{u.id}</Table.Td>
                  <Table.Td>{u.name}</Table.Td>
                  <Table.Td>{u.email}</Table.Td>
                  <Table.Td>
                    <Badge>{u.role}</Badge>
                  </Table.Td>
                  <Table.Td>{u.address ?? "—"}</Table.Td>
                  <Table.Td>{u.phone ?? "—"}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Title order={4} mb="sm">
            Productos
          </Title>
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>ID</Table.Th>
                <Table.Th>Nombre</Table.Th>
                <Table.Th>Categoría</Table.Th>
                <Table.Th>Precio</Table.Th>
                <Table.Th>Stock</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {products.map((p) => (
                <Table.Tr key={p.id}>
                  <Table.Td>{p.id}</Table.Td>
                  <Table.Td>{p.name}</Table.Td>
                  <Table.Td>{p.category.name}</Table.Td>
                  <Table.Td>
                    <NumberFormatter
                      value={p.price}
                      prefix="Q"
                      decimalScale={2}
                    />
                  </Table.Td>
                  <Table.Td>{p.stock}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Title order={4} mb="sm">
            Pedidos
          </Title>
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>ID</Table.Th>
                <Table.Th>Cliente</Table.Th>
                <Table.Th>Fecha</Table.Th>
                <Table.Th>Total</Table.Th>
                <Table.Th>Estado</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {orders.map((o) => (
                <Table.Tr key={o.id}>
                  <Table.Td>{o.id}</Table.Td>
                  <Table.Td>
                    {o.user.name} ({o.user.email})
                  </Table.Td>
                  <Table.Td>
                    {new Date(o.createdAt).toLocaleDateString()}
                  </Table.Td>
                  <Table.Td>
                    <NumberFormatter
                      value={o.total}
                      prefix="Q"
                      decimalScale={2}
                    />
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light">{o.status}</Badge>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      </Stack>
    </Container>
  );
}
