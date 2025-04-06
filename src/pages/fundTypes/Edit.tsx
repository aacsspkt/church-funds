import { useEffect } from "react";

import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import { FieldInfo } from "@/components/FieldInfo";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import db from "@/lib/database";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";

export default function FundTypeEditPage() {
	const { id } = useParams();

	console.log("id:", id);

	const { error, data: fundTypes } = useQuery({
		queryKey: ["fund_types"],
		queryFn: async () => {
			const result = await db.select("SELECT * FROM fund_type WHERE id = $1", [id]);

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
		console.log("Some error occured in fetching fund types.");
		return (
			<div className="text-destructive">Some error occured while fetching fund types.</div>
		);
	}

	const navigate = useNavigate();

	const form = useForm({
		defaultValues: {
			name: "",
			description: "",
		},
		onSubmit: async ({ value }) => {
			// Do something with form data
			console.log(value);
			const modifiedAt = Math.floor(Date.now() / 1000);
			const result = await db.execute(
				`UPDATE fund_type SET
				name = $1, 
				description = $2,
				modified_at = $3
				WHERE id = $4`,
				[value.name, value.description, modifiedAt, id],
			);

			console.log("result", result);

			if (result.rowsAffected) {
				toast.success(<div>Fund type updated successfully!</div>);
			} else {
				toast.error(<div>Error updating fund type!</div>);
			}

			navigate("/fund-types");
		},
	});

	useEffect(() => {
		if (fundTypes) {
			const fundType = fundTypes[0];

			form.setFieldValue("name", fundType.name);
			form.setFieldValue("description", fundType.description);
		}
	}, [fundTypes, form]);

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

		navigate("/fund-types");
	};

	return (
		<div className="w-full w-fit">
			<Breadcrumb className="p-4">
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink href="/">Home</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbLink href="/fund-types">Fund Types</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>New</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
			<h1 className="px-4 py-6 text-2xl font-bold">Create New Fund Type</h1>
			<form
				className="w-full flex flex-col p-4 space-y-2"
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<div className="flex flex-col space-y-2">
					{/* A type-safe field component*/}
					<form.Field
						name="name"
						validators={{
							onChange: ({ value }) =>
								!value
									? "A Name is required"
									: value.length < 3
									? "Name must be at least 3 characters"
									: undefined,
							// onChangeAsyncDebounceMs: 500,
							// onChangeAsync: async ({ value }) => {
							// 	await new Promise((resolve) => setTimeout(resolve, 1000));
							// 	return (
							// 		value.includes("error") && 'No "error" allowed in first name'
							// 	);
							// },
						}}
						children={(field) => {
							// Avoid hasty abstractions. Render props are great!
							return (
								<>
									<div className="flex items-baseline flex-row space-x-4">
										<Label
											className="w-36"
											htmlFor={field.name}
										>
											Name:
										</Label>
										<Input
											className="w-xl p-2 border border-gray-400 rounded"
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
									</div>
									<FieldInfo field={field} />
								</>
							);
						}}
					/>
					<form.Field
						name="description"
						validators={{
							onChange: ({ value }) =>
								value && value.length === 5
									? "Description must be at least 5 characters"
									: undefined,
							// onChangeAsyncDebounceMs: 500,
							// onChangeAsync: async ({ value }) => {
							// 	await new Promise((resolve) => setTimeout(resolve, 1000));
							// 	return (
							// 		value.includes("error") && 'No "error" allowed in first name'
							// 	);
							// },
						}}
						children={(field) => {
							// Avoid hasty abstractions. Render props are great!
							return (
								<>
									<div className="flex items-baseline flex-row space-x-4">
										<Label
											className="w-36"
											htmlFor={field.name}
										>
											Description:
										</Label>
										<Input
											className="w-xl p-2 border border-gray-400 rounded"
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
									</div>
									<FieldInfo field={field} />
								</>
							);
						}}
					/>
					<div className="flex flex-row space-x-4 items-baseline ">
						<Button
							type="submit"
							className="w-36 rounded text-center items-center mt-4 p-3 shadow text-white"
						>
							Save
						</Button>
						<Button
							type="button"
							onClick={async () => await deleteFundType(Number(id!))}
							variant={"destructive"}
							className="w-36 rounded text-center items-center mt-4 p-3 shadow text-white"
						>
							Delete
						</Button>
					</div>
					<Button
						type="button"
						onClick={() => navigate("/fund-types")}
						variant={"secondary"}
						className="w-36 rounded text-primary text-center items-center mt-4 p-3 shadow "
					>
						Back
					</Button>
				</div>
			</form>
		</div>
	);
}
