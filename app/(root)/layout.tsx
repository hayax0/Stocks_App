// CORREÇÃO 3: Importando do lugar certo (sem o /ui/)
import Header from "@/components/Header";
import { Providers } from "./providers";
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return redirect('/sign-in');
  }

  // Prepara os dados. Se user for undefined, passa null para não quebrar
  const user = session.user ? {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
  } : null;

  return (
    <Providers>
      <main className="min-h-screen text-gray-400">
        {/* Agora o Header aceita 'user' porque atualizamos o arquivo dele acima */}
        <Header user={user} />

        <div className="container py-10">
          {children}
        </div>
      </main>
    </Providers>
  )
}

export default Layout;