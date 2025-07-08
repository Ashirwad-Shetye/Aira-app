"use client";
import React from "react";
import ProfileMenu from "../profile-menu/profile-menu";

type Props = {};

const LeftNavbar = (props: Props) => {
	return (
		<div className='border bg-white rounded-lg flex p-2 pb-0 shadow flex-col relative items-center justify-between'>
			<div>
				<div className='w-10 h-10 rounded-md bg-gray-100'>.</div>
			</div>
			<div>
				<div>
					<ProfileMenu />
				</div>
			</div>
		</div>
	);
};

export default LeftNavbar;
