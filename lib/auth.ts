import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

declare module "next-auth" {
	interface Session {
		accessToken?: string;
		login?: string;
	}
}

export const { handlers, auth, signIn, signOut } = NextAuth({
	providers: [
		GitHub({
			clientId: process.env.GITHUB_CLIENT_ID!,
			clientSecret: process.env.GITHUB_CLIENT_SECRET!,
			authorization: {
				params: {
					scope: "read:user user:email repo",
				},
			},
		}),
	],
	callbacks: {
		async jwt({ token, account, profile }) {
			if (account) {
				token.accessToken = account.access_token;
			}
			if (profile) {
				token.login = (profile as { login?: string }).login;
			}
			return token;
		},
		async session({ session, token }) {
			session.accessToken = token.accessToken as string | undefined;
			session.login = token.login as string | undefined;
			return session;
		},
	},
});
