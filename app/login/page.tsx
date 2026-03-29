/* eslint-disable @typescript-eslint/no-explicit-any */
import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<any>;
}) {
  const params = await (searchParams ?? {});
  const redirectRaw = (params as any)?.redirect;
  const redirect = Array.isArray(redirectRaw)
    ? redirectRaw[0]
    : (redirectRaw ?? "/");

  return <LoginForm redirect={redirect} />;
}
