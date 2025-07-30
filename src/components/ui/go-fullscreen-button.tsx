// go-fullscreen-button.jsx
 "use client";
import React, { useEffect, useState } from "react";
import Icons from "./icons";

const GoFullscreenButton = () => {
	const [isFullscreen, setIsFullscreen] = useState(false);

	useEffect(() => {
		const handleChange = () => {
			setIsFullscreen(!!document.fullscreenElement);
		};
		document.addEventListener("fullscreenchange", handleChange);
		// Set initial state
		setIsFullscreen(!!document.fullscreenElement);
		return () => {
			document.removeEventListener("fullscreenchange", handleChange);
		};
	}, []);

	const handleFullscreen = () => {
		if (!document.fullscreenElement) {
			document.documentElement.requestFullscreen();
		} else {
			document.exitFullscreen();
		}
	};

	return (
		<button
			type='button'
			onClick={handleFullscreen}
			className='shrink-0 cursor-pointer w-fit pl-1 pr-2 h-6 gap-1 rounded flex items-center justify-center text-lg hover:bg-gray-100 text-gray-800 active:scale-95 duration-150 transition-all'
		>
			{isFullscreen ? (
				<>
					<Icons.exitFullscreen />
					<h1 className='text-sm'>Exit Focus</h1>
				</>
			) : (
				<>
					<Icons.fullscreen />
					<h1 className='text-sm'>Focus</h1>
				</>
			)}
		</button>
	);
};

export default GoFullscreenButton;