"use client";
import { useEffect, useState } from "react";
import {
  AppShell,
  Anchor,
  Badge,
  Button,
  Card,
  Container,
  Group,
  Image,
  SimpleGrid,
  Text,
  Title,
} from "@mantine/core";
import Link from "next/link";
import { useCart } from "../lib/cart";

type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  stock: number;
  category: { id: number; name: string };
};

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const cart = useCart();

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Title order={3}>ANKOR</Title>
          <Group>
            <Anchor component={Link} href="/">
              Catálogo
            </Anchor>
            <Anchor component={Link} href="/cart">
              Carrito ({cart.items.length})
            </Anchor>
            <Anchor component={Link} href="/profile">
              Perfil
            </Anchor>
            <Anchor component={Link} href="/admin">
              Admin
            </Anchor>
            <Anchor component={Link} href="/login">
              Login
            </Anchor>
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Main>
        <Container size="xl">
          <Title order={2} mb="md">
            Catálogo
          </Title>
          {loading ? (
            <Text>Cargando...</Text>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }}>
              {products.map((product) => (
                <Card key={product.id} withBorder shadow="sm" radius="md">
                  {product.image && (
                    <Card.Section>
                      <Image src={product.image} alt={product.name} h={200} />
                    </Card.Section>
                  )}
                  <Group justify="space-between" mt="md">
                    <Text fw={600}>{product.name}</Text>
                    <Badge>{product.category.name}</Badge>
                  </Group>
                  <Text size="sm" c="dimmed" lineClamp={2} mt={4}>
                    {product.description}
                  </Text>
                  <Group justify="space-between" mt="md">
                    <Text fw={700}>Q{product.price.toFixed(2)}</Text>
                    <Button
                      size="xs"
                      onClick={() =>
                        cart.add({
                          productId: product.id,
                          name: product.name,
                          price: product.price,
                          image: product.image,
                        })
                      }
                    >
                      Agregar
                    </Button>
                  </Group>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
