import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

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
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import db from "@/lib/database";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";

import { FieldInfo } from "../../components/FieldInfo";
import { isEmailValid } from "../../lib/isEmailValid";

export default function ChurchMemberNewPage() {
	const { id } = useParams();
	console.log("id", id);

	const navigate = useNavigate();

	const { error, data: churches } = useQuery({
		queryKey: ["churches"],
		queryFn: async () => {
			const result = await db.select("SELECT * FROM church ORDER BY created_at DESC");

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
		console.log("Some error occured in fetching churches.");
		return <div className="text-destructive">Some error occured while fetching churches.</div>;
	}

	const form = useForm({
		defaultValues: {
			name: "",
			email: "",
			address: "",
			phone1: "",
			phone2: "",
			churchId: "",
		},
		onSubmit: async ({ value }) => {
			// Do something with form data
			console.log(value);
			const createdAt = Math.floor(Date.now() / 1000);
			const modifiedAt = createdAt;

			console.log("createdAt:", createdAt);
			console.log("modifiedAt:", modifiedAt);
			const result = await db.execute(
				`
					INSERT INTO member
					(name, email, address, phone1, phone2, church_id, created_at, modified_at)
					values ($1, $2, $3, $4, $5, $6, $7, $8)`,
				[
					value.name,
					value.email ? value.email : null,
					value.address,
					value.phone1,
					value.phone2 ? value.phone2 : null,
					Number(value.churchId),
					createdAt,
					modifiedAt,
				],
			);

			console.log("result:", result);

			if (result.rowsAffected) {
				toast.success("Church member created successfully.");
			} else {
				toast.error("Error creating church member.");
			}

			navigate("/church-members");
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
						<BreadcrumbLink href="/church-members">Church Members</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>New</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
			<h1 className="px-4 py-6 text-2xl font-bold">Create New Church Member</h1>
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
						name="email"
						validators={{
							onChange: ({ value }) =>
								value && !isEmailValid(value) ? "Invalid email" : undefined,
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
											Email:
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
						name="address"
						validators={{
							onChange: ({ value }) =>
								!value ? "An Address is required" : undefined,
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
											Address:
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
						name="phone1"
						validators={{
							onChange: ({ value }) =>
								!value
									? "A Phone is required"
									: value.length < 10 || value.length > 15
									? "Name must be within 10 to 15 characters"
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
											{"Phone (Primary):"}
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
						name="phone2"
						validators={{
							onChange: ({ value }) =>
								value && value.length < 3
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
											{"Phone (Secondary):"}
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
						name="churchId"
						validators={{
							onChange: ({ value }) =>
								!value ? "Church Name is required" : undefined,
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
											Church Name:
										</Label>
										<Select onValueChange={field.handleChange}>
											<SelectTrigger className="w-xl p-2 border border-gray-400 rounded">
												<SelectValue placeholder="Select a church" />
											</SelectTrigger>
											<SelectContent>
												<SelectGroup>
													<SelectLabel>Churches</SelectLabel>
													{churches
														? churches.map((church) => {
																return (
																	<SelectItem
																		key={church.id}
																		value={church.id.toString()}
																	>
																		{church.name}
																	</SelectItem>
																);
														  })
														: null}
												</SelectGroup>
											</SelectContent>
										</Select>
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
						onClick={() => navigate("/church-members")}
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
