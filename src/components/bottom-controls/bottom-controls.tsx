"use client";

import React from "react";
import GoFullscreenButton from "../ui/go-fullscreen-button";

type Props = {};

const BottomControls = (props: Props) => {
	return (
		<div className='w-full py-1 px-2 flex justify-end items-end backdrop-blur-lg absolute bottom-0'>
			<GoFullscreenButton />
		</div>
	);
};

export default BottomControls;
