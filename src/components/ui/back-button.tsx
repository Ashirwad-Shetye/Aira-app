"use client"

import React from 'react'
import { Button } from './button';
import Icons from './icons';
import { useRouter } from 'next/navigation';

type Props = {}

const BackButton = ( props: Props ) => {
    const router = useRouter();
    return (
		<Button
			variant='secondary'
			onClick={() => router.back()}
			className='flex items-center text-sm gap-1 text-gray-500'
		>
			<Icons.arrowLeft />
			<p>Back</p>
		</Button>
	);
}

export default BackButton