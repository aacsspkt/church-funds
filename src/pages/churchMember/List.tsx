import { ArrowUpDown, SquarePen, Trash } from "lucide-react";
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
import { shortenString } from "@/lib/shortenString";
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
		const countResult = await db.select<{ ["COUNT(id)"]: number }[]>(
			"SELECT COUNT(id) FROM fund WHERE member_id = $1",
			[id],
		);

		const count = countResult[0]["COUNT(id)"];
		console.log("fund count:", count);

		if (count && count > 0) {
			toast.error(<div>Cannot delete member with funds!</div>);
			return;
		}

		const result = await db.execute("DELETE FROM member WHERE id = $1", [id]);
		console.log("delete result:", result);

		if (result.rowsAffected) {
			toast.success(<div>Church member deleted successfully!</div>);
		} else {
			toast.error(<div>Error deleting church member!</div>);
		}

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
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="text-sm font-bold"
					>
						Id
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				);
			},
		},
		{
			accessorKey: "name",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className={"text-sm font-bold"}
					>
						Name
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				);
			},
			cell: ({ row }) => {
				const member = row.original;
				return <div className="text-sm">{shortenString(member.name, 20, "end")}</div>;
			},
		},
		{
			accessorKey: "email",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className={"text-sm font-bold"}
					>
						Email
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				);
			},
			cell: ({ row }) => {
				const member = row.original;
				return (
					<div className="text-sm">
						{member.email ? shortenString(member.email, 23, "middle") : ""}
					</div>
				);
			},
		},
		{
			accessorKey: "phone1",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className={"text-sm font-bold"}
					>
						Phone 1
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				);
			},
		},
		{
			accessorKey: "phone2",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className={"text-sm font-bold"}
					>
						Phone 2
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				);
			},
		},
		{
			accessorKey: "address",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className={"text-sm font-bold"}
					>
						Address
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				);
			},
			cell: ({ row }) => {
				const member = row.original;
				return <div className="text-sm">{shortenString(member.address, 20, "end")}</div>;
			},
		},
		{
			accessorKey: "church_id",
			accessorFn: (row) => {
				const churchId = row.church_id;
				if (churches) {
					const church = churches?.find((ch) => Number(ch.id) === Number(churchId));
					return church ? (church.name satisfies string) : "";
				} else {
					return "";
				}
			},
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className={"text-sm font-bold"}
					>
						Church
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				);
			},

			cell: ({ row }) => {
				console.log("row:", row);
				const member = row.original;
				if (churches) {
					const church = churches?.find(
						(ch) => Number(ch.id) === Number(member.church_id),
					);
					return <div>{church ? shortenString(church.name, 20, "end") : ""}</div>;
				} else {
					return <div>-</div>;
				}
			},
		},
		// {
		// 	accessorKey: "created_at",
		// 	header: ({ column }) => {
		// 		return (
		// 			<Button
		// 				variant="ghost"
		// 				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
		// 			>
		// 				Created At
		// 				<ArrowUpDown className="ml-2 h-4 w-4" />
		// 			</Button>
		// 		);
		// 	},
		// 	// accessorFn: (row) => new Date(Number(row.created_at) * 1000),
		// 	cell: ({ row }) => (
		// 		<div className="">
		// 			{new Date(Number(row.getValue("created_at")) * 1000).toLocaleDateString()}
		// 		</div>
		// 	),
		// },
		// {
		// 	accessorKey: "modified_at",
		// 	header: ({ column }) => {
		// 		return (
		// 			<Button
		// 				variant="ghost"
		// 				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
		// 			>
		// 				Modified At
		// 				<ArrowUpDown className="ml-2 h-4 w-4" />
		// 			</Button>
		// 		);
		// 	},
		// 	// accessorFn: (row) => new Date(Number(row.modified_at) * 1000),
		// 	cell: ({ row }) => (
		// 		<div className="">
		// 			{new Date(Number(row.getValue("modified_at")) * 1000).toLocaleDateString()}
		// 		</div>
		// 	),
		// },
		{
			id: "actions",
			enableHiding: false,
			header: () => <div className={"text-sm font-bold"}>Actions</div>,
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
