 "use client";

import React from 'react'
import { Badge } from '../ui/badge';

type Props = {
	tags: string[];
	className?: string;
	activeTag?: string | null;
	onTagSelect?: (tag: string | null) => void;
};

const TagsBar = ({ tags, className, activeTag, onTagSelect }: Props) => {
	return (
		<div className='flex gap-2 flex-nowrap bg-white w-full text-xs'>
			<Badge
				variant='outline'
				onClick={() => onTagSelect?.(null)}
				className={`${className} shrink-0 text-nowrap ${
					activeTag === null ? "bg-gray-100 text-black" : "text-gray-700"
				} hover:bg-gray-100 duration-150 cursor-pointer select-none  border px-3 py-1`}
			>
				<p># All</p>
			</Badge>
			{tags.length > 0 ? (
				<>
					<div className='w-0.5 bg-gray-400'></div>
					<div className='overflow-x-auto scrollbar-hide text-nowrap flex-nowrap flex-grow flex gap-2'>
						{tags.map((tag, id) => (
							<Badge
								key={id}
								variant='outline'
								onClick={() => onTagSelect?.(tag)}
								className={`shrink-0 text-nowrap ${
									activeTag === tag ? "bg-gray-100 text-black" : "text-gray-700"
								} hover:bg-gray-100 duration-150 cursor-pointer select-none  border px-3 py-1`}
							>
								<p># {tag}</p>
							</Badge>
						))}
					</div>
				</>
			) : null}
		</div>
	);
};

export default TagsBar