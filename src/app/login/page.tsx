"use client";
import { useState } from "react";
import {
  Alert,
  Button,
  Container,
  Paper,
  PasswordInput,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Error al iniciar sesión");
      return;
    }
    router.push("/");
  }

  return (
    <Container size={420} my={80}>
      <Title ta="center">Iniciar sesión</Title>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={onSubmit}>
          <Stack>
            <TextInput
              label="Email"
              placeholder="tu@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
            />
            <PasswordInput
              label="Contraseña"
              required
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
            />
            {error && <Alert color="red">{error}</Alert>}
            <Button type="submit" loading={loading} fullWidth>
              Entrar
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
