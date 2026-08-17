import { verifySession } from "./session";
import { UnauthorizedError } from "@/lib/shared/errors";

// Satu-satunya guard yang perlu ada — hanya 1 role (admin), tidak ada RBAC
// bertingkat (Blueprint §7, TSD §4.1). Dipanggil di awal tiap Route Handler admin.
export async function requireAdmin() {
  const session = await verifySession();
  if (!session) {
    throw new UnauthorizedError();
  }
  return { adminId: session.user.id, adminEmail: session.user.email ?? "" };
}
