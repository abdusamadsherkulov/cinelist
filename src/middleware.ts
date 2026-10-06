import { withAuth } from "next-auth/middleware";

export default withAuth({ pages: { signIn: "/login" } });

export const config = {
    matcher: ["/library/:path*", "/messages/:path*", "/u/:path*", "/notifications", "/onboarding"],
};