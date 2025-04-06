import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from "lucide-react";

import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";

import { Button } from "./button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	});

	return (
		<div className="mx-4 rounded-md border overflow-x-scroll min-w-fit">
			<Table className="w-full">
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => {
								return (
									<TableHead key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
											  )}
									</TableHead>
								);
							})}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRow
								key={row.id}
								data-state={row.getIsSelected() && "selected"}
							>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell
								colSpan={columns.length}
								className="h-24 text-center"
							>
								No results.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
			<div className="flex flex-row items-center justify-start space-x-2 py-4 px-2">
				{/* <p className="flex-1 text-sm text-muted-foreground">
					{table.getSelectedRowModel().rows.length} of {table.getRowModel().rows?.length}{" "}
					row(s){" "}
				</p> */}
				{/* <div className="flex flex-row space-x-2 items-center justify-center"> */}
				<Button
					variant={"ghost"}
					type="button"
					size={"icon"}
					className="w-9 h-7 p-1.5 border border-gray-300"
					onClick={() => table.firstPage()}
				>
					<ChevronFirst className="w-4 h-4" />
				</Button>
				<Button
					variant={"ghost"}
					type="button"
					size={"icon"}
					className="w-9 h-7 p-1.5 border border-gray-300"
					onClick={() => table.previousPage()}
				>
					<ChevronLeft className="w-4 h-4" />
				</Button>
				<Button
					variant={"ghost"}
					type="button"
					size={"icon"}
					className="w-9 h-7 p-1.5 border border-gray-300"
					onClick={() => table.nextPage()}
				>
					<ChevronRight className="w-4 h-4" />
				</Button>
				<Button
					variant={"ghost"}
					type="button"
					size={"icon"}
					className="w-9 h-7 p-1.5 border border-gray-300"
					onClick={() => table.lastPage()}
				>
					<ChevronLast className="w-4 h-4" />
				</Button>
				<p className="text-sm text-muted-foreground">
					Total pages: {table.getPageCount()}{" "}
				</p>
				{/* </div> */}
			</div>
		</div>
	);
}
