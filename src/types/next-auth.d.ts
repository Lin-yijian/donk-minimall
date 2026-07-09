import type { MembershipTier } from "@/lib/membership";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
    membershipTier?: MembershipTier;
  }

  interface Session {
    user: {
      id: string;
      role: string;
      membershipTier: MembershipTier;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    membershipTier: MembershipTier;
  }
}
