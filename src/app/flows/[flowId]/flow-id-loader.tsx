
export default function Loading() {
	return (
		<div className='p-5 flex flex-col overflow-hidden relative w-full flex-1'>
			<div className='flex gap-5 flex-1 relative'>
				<div className='w-64 bg-gray-100 animate-pulse' />{" "}
				{/* LeftNavbar skeleton */}
				<div className='flex flex-col w-full'>
					<div className='flex items-center gap-5'>
						<div className='h-10 w-20 bg-gray-100 animate-pulse' />{" "}
						{/* Back button */}
						<div className='h-8 w-40 bg-gray-100 animate-pulse' /> {/* Title */}
					</div>
					<div className='mt-5 h-10 w-80 bg-gray-100 animate-pulse' />{" "}
					{/* Search bar */}
					<div className='grid grid-cols-3 gap-4 mt-5'>
						{[...Array(3)].map((_, i) => (
							<div
								key={i}
								className='h-32 bg-gray-100 animate-pulse rounded-xl'
							/>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}