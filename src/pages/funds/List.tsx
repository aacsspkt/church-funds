import { SquarePen, Trash } from "lucide-react";
import { Link } from "react-router";

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
import { Checkbox } from "@radix-ui/react-checkbox";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";

type Fund = {
	id: number;
	member_id: number;
	amount: number;
	fund_type_id: number;
	created_at: number;
	modified_at: number;
};

export default function FundListPage() {
	const {
		error: fundCountError,
		data: fundCount,
		refetch: refetchFundCount,
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

	if (fundCountError) {
		console.log("fund count error:", fundCountError);
		return <div className="text-destructive">Some error occured</div>;
	}

	const {
		error,
		data: funds,
		refetch: refetchFunds,
	} = useQuery({
		queryKey: ["funds"],
		queryFn: async () => {
			const result = await db.select("SELECT * FROM fund ORDER BY created_at DESC");

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
		console.log("error:", error);
		return <div className="text-destructive">Some Error Occured.</div>;
	}

	const { error: membersError, data: members } = useQuery({
		queryKey: ["members"],
		queryFn: async () => {
			const result = await db.select("SELECT * FROM member ORDER BY created_at DESC");

			if (!result) {
				return [];
			}

			if (!Array.isArray(result)) {
				throw new Error("Result is not an array");
			}

			return result;
		},
	});

	if (membersError) {
		console.log("error:", membersError);
		return <div className="text-destructive">Some Error Occured.</div>;
	}

	const { error: fundTypeError, data: fundTypes } = useQuery({
		queryKey: ["fund_types"],
		queryFn: async () => {
			const result = await db.select("SELECT * FROM fund_type ORDER BY created_at DESC");

			if (!result) {
				return [];
			}

			if (!Array.isArray(result)) {
				throw new Error("Result is not an array");
			}

			return result;
		},
	});

	if (fundTypeError) {
		console.log("error:", fundTypeError);
		return <div className="text-destructive">Some Error Occured.</div>;
	}

	const deleteFund = async (id: number) => {
		const result = await db.execute("DELETE FROM fund WHERE id = $1", [id]);
		console.log("delete result:", result);

		refetchFunds();
		refetchFundCount();
	};

	const columns: ColumnDef<Fund>[] = [
		{
			id: "select",
			header: ({ table }) => (
				<Checkbox
					checked={
						table.getIsAllPageRowsSelected() ||
						(table.getIsSomePageRowsSelected() && "indeterminate")
					}
					onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
					aria-label="Select all"
				/>
			),
			cell: ({ row }) => (
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(value) => row.toggleSelected(!!value)}
					aria-label="Select row"
				/>
			),
			enableSorting: false,
			enableHiding: false,
		},
		{
			accessorKey: "id",
			header: "#",
		},
		{
			// accessorKey: "member_id",
			header: "Member",
			cell: ({ row }) => {
				console.log("row:", row);
				const fund = row.original;
				if (members) {
					const member = members?.find(
						(member) => Number(member.id) === Number(fund.member_id),
					);
					return <div>{member.name satisfies string}</div>;
				} else {
					return <div>-</div>;
				}
			},
		},
		{
			// accessorKey: "fund_type_id",
			header: "Fund Type",
			cell: ({ row }) => {
				console.log("row:", row);
				const fund = row.original;
				if (fundTypes) {
					const fundType = fundTypes?.find(
						(ft) => Number(ft.id) === Number(fund.fund_type_id),
					);
					return <div>{fundType.name satisfies string}</div>;
				} else {
					return <div>-</div>;
				}
			},
		},
		{
			accessorKey: "amount",
			header: "Amount",
		},
		{
			accessorKey: "created_at",
			header: "Created At",
			// accessorFn: (row) => new Date(Number(row.created_at) * 1000),
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
				const fund = row.original;

				return (
					<div className="flex flex-row space-x-2">
						<Link
							className="w-7 h-7 p-1.5 border border-gray-300 rounded-md"
							to={`/funds/${fund.id}/edit`}
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
										This will delete Fund with id {fund.id}
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction
										className="bg-destructive hover:bg-red-700 shadow-md"
										onClick={async () => await deleteFund(fund.id)}
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
						<BreadcrumbPage>Funds</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
			<div className="w-full p-4 flex flex-row space-x-4 items-center">
				<h1 className="text-2xl font-bold">Funds</h1>
				<Link
					to={"/funds/new"}
					className="bg-primary rounded-md text-secondary items-center text-center w-20 px-4 py-2 text-sm"
				>
					New
				</Link>
			</div>
			<DataTable
				columns={columns}
				data={funds ? funds : []}
			/>
		</div>
	);
}
