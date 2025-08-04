import Link from "next/link";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "next/navigation";

interface CustomBreadcrumbProps {
	flowId?: string;
	flowTitle?: string | null;
	momentId?: string;
	momentTitle?: string;
	isLoading?: boolean;
}

const CustomBreadcrumb = ({
	flowId,
	flowTitle,
	momentId,
	momentTitle,
	isLoading = false,
}: CustomBreadcrumbProps ) => {
	
	const searchParams = useSearchParams();
	const type = searchParams.get("type");

	if (isLoading) {
		return (
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<Skeleton className='h-8 w-24' />
					</BreadcrumbItem>
					{momentTitle && (
						<>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<Skeleton className='h-8 w-32' />
							</BreadcrumbItem>
						</>
					)}
				</BreadcrumbList>
			</Breadcrumb>
		);
	}

	return (
		<Breadcrumb className='relative w-full min-w-0'>
			<BreadcrumbList className='flex flex-nowrap relative w-full max-w-full min-w-0'>
				<BreadcrumbItem className='flex-nowrap text-nowrap truncate min-w-0'>
					<BreadcrumbLink
						asChild
						className='flex-nowrap text-nowrap truncate min-w-0'
					>
						<Link
							href={`/flows/${flowId || ""}${
								type !== undefined && "?type=shared"
							}`}
						>
							<span className='inline-block align-bottom truncate whitespace-nowrap max-w-full min-w-0'>
								{flowTitle || "..."}
							</span>
						</Link>
					</BreadcrumbLink>
				</BreadcrumbItem>
				{momentTitle && (
					<>
						<BreadcrumbSeparator />
						<BreadcrumbItem className='flex-nowrap text-nowrap truncate min-w-0'>
							<BreadcrumbPage className='flex-nowrap text-nowrap truncate min-w-0'>
								<span className='inline-block align-bottom truncate whitespace-nowrap max-w-full min-w-0'>
									{momentTitle || "..."}
								</span>
							</BreadcrumbPage>
						</BreadcrumbItem>
					</>
				)}
			</BreadcrumbList>
		</Breadcrumb>
	);
};

export default CustomBreadcrumb;
