 "use client";

import React from "react";
import GoFullscreenButton from "../ui/go-fullscreen-button";
import Icons from "../ui/icons";

type Props = {
	status?: boolean
	isSaving?: boolean
};

const BottomControls = ( {
	status,
	isSaving
}: Props) => {
	return (
		<div className='w-full p-2 flex justify-end items-center gap-5 absolute bottom-0 bg-gradient-to-b from-transparent via-white/80 to-white'>
			{status && (
				<div className='text-sm flex items-center gap-1 text-gray-500'>
					{isSaving ? (
						<>
							<Icons.loader className='shrink-0 animate-spin' />
							<p>Saving...</p>
						</>
					) : (
						<>
							<Icons.check className='shrink-0' />
							<p> All changes saved</p>
						</>
					)}
				</div>
			)}
			<GoFullscreenButton />
		</div>
	);
};

export default BottomControls;
