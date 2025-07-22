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
	scrollContainerRef,
}: ScrollableHeaderLayoutProps) {
	const defaultScrollRef = useRef<HTMLDivElement>(null);
	const [showHeader, setShowHeader] = useState(true);
	const [lastScrollTop, setLastScrollTop] = useState(0);
	const [shadow, setShadow] = useState(false);

	useEffect(() => {
		const container = scrollContainerRef?.current || defaultScrollRef.current;
		if (!container) return;

		let ticking = false;
		const SCROLL_THRESHOLD = 160;
		const BUFFER = 20;

		const handleScroll = () => {
			if (ticking) return;

			ticking = true;
			requestAnimationFrame(() => {
				const scrollTop = container.scrollTop;

				// Add shadow when past threshold
				setShadow(scrollTop > 10);

				if (scrollTop > SCROLL_THRESHOLD + BUFFER) {
					if (scrollTop > lastScrollTop + 5) {
						setShowHeader(false);
					} else if (scrollTop < lastScrollTop - 5) {
						setShowHeader(true);
					}
				} else {
					setShowHeader(true); // Always show above threshold
				}

				setLastScrollTop(Math.max(0, scrollTop));
				ticking = false;
			});
		};

		container.addEventListener("scroll", handleScroll);
		return () => container.removeEventListener("scroll", handleScroll);
	}, [lastScrollTop, scrollContainerRef]);

	return (
		<div className='flex flex-col overflow-hidden relative w-full flex-1 min-h-0'>
			<div
				className={cn(
					"sticky top-0 z-30 bg-white transition-all duration-500 ease-in-out",
					showHeader
						? "opacity-100 translate-y-0 delay-100"
						: "opacity-0 -translate-y-full",
					shadow && "shadow-sm"
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