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
}: CustomBreadcrumbProps) => {
	if (isLoading) {
		return (
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<Skeleton className="h-4 w-24" />
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<Skeleton className="h-4 w-32" />
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
		);
	}

	return (
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink asChild>
						<Link href={`/flows/${flowId || ""}`}>
							{flowTitle || "..."}
						</Link>
					</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbPage>
						{momentTitle || "New Moment"}
					</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>
	);
};

export default CustomBreadcrumb;
