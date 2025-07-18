"use client";

import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ScrollableHeaderLayoutProps {
	header: React.ReactNode;
	children: React.ReactNode;
	scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}

export default function ScrollableHeaderLayout({
	header,
	children,
	scrollContainerRef, // Accept the ref from the parent
}: ScrollableHeaderLayoutProps) {
	const defaultScrollRef = useRef<HTMLDivElement>(null);
	const [showHeader, setShowHeader] = useState(true);
	const [lastScrollTop, setLastScrollTop] = useState(0);

	useEffect(() => {
		const container = scrollContainerRef?.current || defaultScrollRef.current;
		if (!container) return;

		const handleScroll = () => {
			const scrollTop = container.scrollTop;
			if (scrollTop > lastScrollTop && scrollTop > 40) {
				setShowHeader(false);
			} else {
				setShowHeader(true);
			}
			setLastScrollTop(scrollTop <= 0 ? 0 : scrollTop);
		};

		container.addEventListener("scroll", handleScroll);
		return () => container.removeEventListener("scroll", handleScroll);
	}, [lastScrollTop, scrollContainerRef]);

	return (
		<div className='flex flex-col overflow-hidden relative w-full flex-1 min-h-0'>
			<div
				className={cn(
					"sticky top-0 z-30 bg-white overflow-hidden transition-all duration-500 ease-in-out",
					showHeader
						? "h-auto opacity-100 translate-y-0 delay-100"
						: "h-0 opacity-0 -translate-y-full"
				)}
			>
				{header}
			</div>

			<div
				ref={defaultScrollRef}
				className='flex flex-col flex-1 overflow-hidden relative w-full min-h-0'
			>
				{children}
			</div>
		</div>
	);
}