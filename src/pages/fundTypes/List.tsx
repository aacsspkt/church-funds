import { SquarePen, Trash } from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import db from "@/lib/database";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";

type FundType = {
	id: number;
	name: string;
	description: string;
	created_at: number;
	modified_at: number;
};

export default function FundTypeListPage() {
	const {
		error: fundTypeCountError,
		data: fundTypeCount,
		refetch: refetchFundTypeCount,
	} = useQuery({
		queryKey: ["memberCount"],
		queryFn: async () => {
			const result = await db.select("SELECT COUNT(id) from member AS count");
			console.log("result count:", result);
			if (!Array.isArray(result) || result.length !== 1) {
				throw new Error("Could not fetch church count.");
			}

			return result[0]["COUNT(id)"] as number;
		},
	});

	if (fundTypeCountError) {
		console.log("fund count error:", fundTypeCountError);
		return <div className="text-destructive">Some error occured</div>;
	}

	const {
		error,
		data: fundTypes,
		refetch: refetchFundTypes,
	} = useQuery({
		queryKey: ["fund_types"],
		queryFn: async () => {
			const result = await db.select(`SELECT * FROM fund_type ORDER BY created_at DESC`);

			if (!result) {
				return [];
			}

			if (!Array.isArray(result)) {
				throw new Error("Result is not an array");
			}

			return result;
		},
	});

	if (error) {
		return <div className="text-destructive">Some Error Occured.</div>;
	}

	// console.log("fundTypes:", fundTypes);

	const deleteFundType = async (id: number) => {
		const countResult = await db.select<{ ["COUNT(id)"]: number }[]>(
			"SELECT COUNT(id) FROM fund WHERE fund_type_id = $1",
			[id],
		);

		const count = countResult[0]["COUNT(id)"];

		if (count && count > 0) {
			toast.error(<div>Cannot deleting fund type having funds</div>);
			return;
		}

		const result = await db.execute("DELETE FROM fund_type WHERE id = $1", [id]);
		console.log("delete result:", result);

		if (result.rowsAffected) {
			toast.success(<div>Fund type deleted successfully!</div>);
		} else {
			toast.error(<div>Error deleting fund type!</div>);
		}

		refetchFundTypes();
		refetchFundTypeCount();
	};

	const columns: ColumnDef<FundType>[] = [
		// {
		// 	id: "select",
		// 	header: ({ table }) => (
		// 		<Checkbox
		// 			checked={
		// 				table.getIsAllPageRowsSelected() ||
		// 				(table.getIsSomePageRowsSelected() && "indeterminate")
		// 			}
		// 			onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
		// 			aria-label="Select all"
		// 		/>
		// 	),
		// 	cell: ({ row }) => (
		// 		<Checkbox
		// 			checked={row.getIsSelected()}
		// 			onCheckedChange={(value) => row.toggleSelected(!!value)}
		// 			aria-label="Select row"
		// 		/>
		// 	),
		// 	enableSorting: false,
		// 	enableHiding: false,
		// },
		{
			accessorKey: "id",
			header: "Id",
		},
		{
			accessorKey: "name",
			header: "Name",
		},
		{
			accessorKey: "description",
			header: "Description",
		},
		{
			accessorKey: "created_at",
			header: "Created At",
			cell: ({ row }) => (
				<div className="">
					{new Date(Number(row.getValue("created_at")) * 1000).toLocaleDateString()}
				</div>
			),
		},
		{
			accessorKey: "modified_at",
			header: "Modified At",
			// accessorFn: (row) => new Date(Number(row.modified_at) * 1000),
			cell: ({ row }) => (
				<div className="">
					{new Date(Number(row.getValue("modified_at")) * 1000).toLocaleDateString()}
				</div>
			),
		},
		{
			id: "actions",
			enableHiding: false,
			header: "Actions",
			cell: ({ row }) => {
				const fundType = row.original;

				return (
					<div className="flex flex-row space-x-2">
						<Link
							className="w-7 h-7 p-1.5 border border-gray-300 rounded-md"
							to={`/fund-types/${fundType.id}/edit`}
						>
							<SquarePen className="w-4 h-4" />
						</Link>
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button
									variant={"ghost"}
									type="button"
									size={"icon"}
									className="w-7 h-7 p-1.5 border border-gray-300"
									onClick={() => {}}
								>
									<Trash className="w-4 h-4" />
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
									<AlertDialogDescription>
										This will delete {fundType.name} with id {fundType.id}
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction
										className="bg-destructive hover:bg-red-700 shadow-md"
										onClick={async () => await deleteFundType(fundType.id)}
									>
										Delete
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				);
			},
		},
	];

	return (
		<div className="w-full min-w-fit">
			<Breadcrumb className="p-4">
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink href="/">Home</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>Fund Types</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
			<div className="w-full p-4 flex flex-row space-x-4 items-center">
				<h1 className="text-2xl font-bold">Fund Types</h1>
				<Link
					to={"/fund-types/new"}
					className="bg-primary rounded-md text-secondary items-center text-center w-20 px-4 py-2 text-sm"
				>
					New
				</Link>
			</div>
			<DataTable
				columns={columns}
				data={fundTypes ? fundTypes : []}
			/>
		</div>
	);
}
