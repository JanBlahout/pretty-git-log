import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const proxy = auth((req) => {
	const isAuthenticated = !!req.auth;
	const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");

	if (isDashboard && !isAuthenticated) {
		const url = req.nextUrl.clone();
		url.pathname = "/";
		url.searchParams.set("callbackUrl", req.nextUrl.pathname);
		return NextResponse.redirect(url);
	}
});

export const config = {
	matcher: ["/dashboard/:path*"],
};
