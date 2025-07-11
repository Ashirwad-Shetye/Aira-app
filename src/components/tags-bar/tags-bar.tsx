"use client"

import React from 'react'

type Props = {
    tags: string[]
}

const TagsBar = ({tags}: Props) => {
  return (
		<div className='flex gap-2 flex-nowrap'>
			<button
				type='button'
				className='text-sm shrink-0 text-nowrap hover:bg-gray-200 duration-150 cursor-pointer select-none font-cabin text-gray-700 bg-gray-100 px-3 py-1 rounded-full'
			>
				<p># All</p>
			</button>
			<div className='w-0.5 bg-gray-400'></div>
			<div className='overflow-x-auto scrollbar-hide text-nowrap flex-nowrap flex-grow flex gap-2'>
				{tags.map((tag, id) => (
					<button
						key={id}
						type='button'
						className='text-sm font-cabin shrink-0 text-nowrap hover:bg-gray-200 duration-150 cursor-pointer select-none text-gray-700 bg-gray-100 px-3 py-1 rounded-full'
					>
						<p># {tag}</p>
					</button>
				))}
			</div>
		</div>
	);
}

export default TagsBar