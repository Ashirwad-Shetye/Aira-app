import "./globals.css";
import { Geist, Geist_Mono, PT_Sans, Cabin, Epilogue } from "next/font/google";
import { Providers } from "@/providers";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const ptSans = PT_Sans({
	variable: "--font-pt-sans",
	weight: ["400", "700"],
	style: ["normal", "italic"],
	subsets: ["latin"],
});

const cabin = Cabin({
	variable: "--font-cabin",
	weight: ["400", "700"],
	style: ["normal", "italic"],
	subsets: ["latin"],
} );

const epilogue = Epilogue({
	variable: "--font-epilogue",
	weight: ["400", "700"],
	style: ["normal", "italic"],
	subsets: ["latin"],
});

export const metadata = {
	title: "Aira",
	description: "Minimal mindful journaling",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang='en'>
			<body
				className={`${geistSans.variable} ${geistMono.variable} ${ptSans.variable} ${cabin.variable} ${epilogue.variable} bg-[#F5FAF8] antialiased h-screen w-screen flex flex-col relative`}
			>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}