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
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";

type ChurchMember = {
	id: number;
	name: string;
	address: string;
	email: string;
	phone1: string;
	phone2: string;
	church_id: number;
	created_at: number;
	modified_at: number;
};

export default function ChurchMemberListPage() {
	const {
		error: countError,
		data: memberCount,
		refetch: refetchMemberCount,
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

	if (countError) {
		console.log("countError:", countError);
		return <div className="text-destructive">Some error occurred.</div>;
	}

	const {
		error: memberError,
		data: members,
		refetch: refetchMembers,
	} = useQuery({
		queryKey: ["members"],
		queryFn: async () => {
			const result = await db.select(`SELECT * FROM member ORDER BY created_at DESC`);
			// console.log("result:", result);

			if (!result) {
				return [];
			}

			if (!Array.isArray(result)) {
				throw new Error("Result is not an array");
			}

			return result;
		},
	});

	if (memberError) {
		console.log("error:", memberError);
		return <div className="text-destructive">Some error occured while fetching members.</div>;
	}

	const { error: churchFetchError, data: churches } = useQuery({
		queryKey: ["churches"],
		queryFn: async () => {
			const result = await db.select("SELECT * FROM church");
			console.log("result:", result);

			if (!result) {
				return [];
			}

			if (!Array.isArray(result)) {
				throw new Error("Result is not an array");
			}

			return result;
		},
	});

	if (churchFetchError) {
		console.log("error:", churchFetchError);
		return <div className="text-destructive">Some error occured while fetching churches.</div>;
	}

	const deleteChurchMember = async (id: number) => {
		const result = await db.execute("DELETE FROM member WHERE id = $1", [id]);
		console.log("delete result:", result);

		refetchMembers();
		refetchMemberCount();
	};

	const columns: ColumnDef<ChurchMember>[] = [
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
			accessorKey: "email",
			header: "Email",
		},
		{
			accessorKey: "phone1",
			header: "Phone 1",
		},
		{
			accessorKey: "phone2",
			header: "Phone 2",
		},
		{
			accessorKey: "address",
			header: "Address",
		},
		{
			header: "Church",
			cell: ({ row }) => {
				console.log("row:", row);
				const member = row.original;
				if (churches) {
					const church = churches?.find(
						(ch) => Number(ch.id) === Number(member.church_id),
					);
					return <div>{church.name satisfies string}</div>;
				} else {
					return <div>-</div>;
				}
			},
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
				const church = row.original;

				return (
					<div className="flex flex-row space-x-2">
						<Link
							className="w-7 h-7 p-1.5 border border-gray-300 rounded-md"
							to={`/church-members/${church.id}/edit`}
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
										This will delete {church.name} with id {church.id}
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction
										className="bg-destructive hover:bg-red-700 shadow-md"
										onClick={async () => await deleteChurchMember(church.id)}
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
						<BreadcrumbPage>Church Members</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
			<div className="w-full p-4 flex flex-row space-x-4 items-center">
				<h1 className="text-2xl font-bold">Members</h1>
				<Link
					to={"/church-members/new"}
					className="bg-primary rounded-md text-secondary items-center text-center w-20 px-4 py-2 text-sm"
				>
					New
				</Link>
			</div>
			<DataTable
				columns={columns}
				data={members ? members : []}
			/>
		</div>
	);
}
