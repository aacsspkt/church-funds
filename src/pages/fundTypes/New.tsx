import { useNavigate } from "react-router";
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

export default function FundTypeNewPage() {
	const navigate = useNavigate();

	const form = useForm({
		defaultValues: {
			name: "",
			description: "",
		},
		onSubmit: async ({ value }) => {
			// Do something with form data
			console.log(value);
			const createdAt = Math.floor(Date.now() / 1000);
			const modifiedAt = createdAt;
			const result = await db.execute(
				"INSERT into fund_type (name, description, created_at, modified_at) VALUES ($1, $2, $3, $4)",
				[value.name, value.description, createdAt, modifiedAt],
			);

			console.log("result", result);

			if (result.rowsAffected) {
				toast.success("Fund Type created successfully!");
			} else {
				toast.error("Error creating Fund Type!");
			}

			navigate("/fund-types");
		},
	});

	return (
		<div className="w-full min-w-fit">
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
