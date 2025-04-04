import { useEffect } from "react";

import { useNavigate, useParams } from "react-router";

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";

import { FieldInfo } from "../../components/FieldInfo";
import db from "../../lib/database";
import { isEmailValid } from "../../lib/isEmailValid";

export default function ChurchEditPage() {
	const { id } = useParams();
	console.log("id:", id);

	const navigate = useNavigate();

	if (!id) {
		navigate("/churches");
	}

	async function deleteChurch(id: number) {
		const result = await db.execute("DELETE FROM CHURCH WHERE id = $1", [id]);
		console.log("deleted result", result);

		navigate("/churches");
	}

	const { error, data } = useQuery({
		queryKey: ["churchDetails"],
		queryFn: async () => {
			const result = await db.select("SELECT * FROM church WHERE id = $1", [id]);

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
		return <div>Error: {error.message}</div>;
	}

	console.log("data:", data);

	const form = useForm({
		defaultValues: {
			name: "",
			address: "",
			email: "",
			phone1: "",
			phone2: "",
		},
		onSubmit: async ({ value }) => {
			// Do something with form data
			if (!id) {
				return;
			}

			console.log(value);
			const modifiedAt = Math.floor(Date.now() / 1000);

			const result = await db.execute(
				"UPDATE church SET name = $1, address = $2, email = $3, phone1 = $4, phone2 = $5, modified_at = $6 WHERE id = $7",
				[
					value.name,
					value.address,
					value.email === "" ? null : value.email,
					value.phone1,
					value.phone2 === "" ? null : value.phone2,
					modifiedAt,
					Number(id),
				],
			);

			console.log("result", result);

			navigate("/churches");
		},
	});

	useEffect(() => {
		if (data && data.length === 1) {
			const church = data[0];
			form.setFieldValue("name", church.name);
			form.setFieldValue("email", church.email ? church.email : "");
			form.setFieldValue("address", church.address);
			form.setFieldValue("phone1", church.phone1);
			form.setFieldValue("phone2", church.phone2 ? church.phone2 : "");
		}
	}, [data, form]);

	return (
		<div className="w-full min-w-fit">
			<Breadcrumb className="p-4">
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink href="/">Home</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbLink href="/churches">Churches</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>Edit</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
			<div className="p-4">
				<h1 className="text-2xl font-bold">Church Details</h1>
			</div>
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
						}}
						children={(field) => {
							// Avoid hasty abstractions. Render props are great!
							return (
								<>
									<div className="flex items-baseline flex-row space-x-4">
										<label
											className="w-36"
											htmlFor={field.name}
										>
											Name:
										</label>
										<input
											className="min-w-xl p-2 border border-gray-400 rounded"
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
						}}
						children={(field) => {
							// Avoid hasty abstractions. Render props are great!
							return (
								<>
									<div className="flex items-baseline flex-row space-x-4">
										<label
											className="w-36"
											htmlFor={field.name}
										>
											Email:
										</label>
										<input
											className="min-w-xl p-2 border border-gray-400 rounded"
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
								!value
									? "An address is required"
									: value.length < 2
									? "Address must be at least 2 characters"
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
										<label
											className="w-36"
											htmlFor={field.name}
										>
											Address:
										</label>
										<input
											className="min-w-xl p-2 border border-gray-400 rounded"
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
									? "Phone must be within 10 to 15 characters"
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
										<label
											className="w-36"
											htmlFor={field.name}
										>
											{"Phone (Primary):"}
										</label>
										<input
											className="min-w-xl p-2 border border-gray-400 rounded"
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
								value && (value.length < 10 || value.length > 15)
									? "Phone must be at least 3 characters"
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
										<label
											className="w-36"
											htmlFor={field.name}
										>
											{"Phone (Secondary):"}
										</label>
										<input
											className="min-w-xl p-2 border border-gray-400 rounded"
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
							onClick={async () => await deleteChurch(Number(id!))}
							variant={"destructive"}
							className="w-36 rounded text-center items-center mt-4 p-3 shadow text-white"
						>
							Delete
						</Button>
					</div>

					<Button
						onClick={async () => await navigate("/churches")}
						className="w-36 rounded text-center items-center p-3 mt-4 shadow border border-gray-300 text-primary"
						variant={"secondary"}
					>
						Back
					</Button>
				</div>
			</form>
		</div>
	);
}
