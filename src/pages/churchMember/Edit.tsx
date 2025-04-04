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

export default function ChurchMemberEditPage() {
	const { id } = useParams();

	const navigate = useNavigate();
	console.log("id", id);

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

	const { error: memberError, data: members } = useQuery({
		queryKey: ["members"],
		queryFn: async () => {
			const result = await db.select("SELECT * FROM member WHERE id = $1", [id]);

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

	if (memberError) {
		console.log("Some error occured in fetching members.");
		return <div className="text-destructive">Some error occured while fetching members.</div>;
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
			console.log("value:", value);

			const modifiedAt = Math.floor(Date.now() / 1000);
			const result = await db.execute(
				`
				UPDATE member SET name = $1, email = $2, address = $3, phone1 = $4, phone2 = $5, church_id = $6, modified_at = $7 WHERE id = $8
				`,

				[
					value.name,
					value.email === "" ? null : value.email,
					value.address,
					value.phone1,
					value.phone2 === "" ? null : value.phone2,
					value.churchId,
					modifiedAt,
					Number(id!),
				],
			);

			console.log("update result:", result);

			navigate("/church-members");
		},
	});

	useEffect(() => {
		if (members) {
			const member = members[0];

			// console.log("member:", member);
			form.setFieldValue("address", member.address);
			form.setFieldValue("churchId", member.church_id.toString());
			form.setFieldValue("email", member.email ? member.email : "");
			form.setFieldValue("name", member.name);
			form.setFieldValue("phone1", member.phone1);
			form.setFieldValue("phone2", member.phone2 ? member.phone2 : "");

			// form.validate("change");
		}
	}, [members, form]);

	const deleteChurchMember = async (id: number) => {
		const result = await db.execute("DELETE FROM member WHERE id = $1", [id]);
		console.log("delete result:", result);

		navigate("/church-members");
	};

	return (
		<div className="w-full min-w-fit">
			<Breadcrumb className="p-4">
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink href="/">Hom e</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbLink href="/church-members">Church Member</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>Edit</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
			<h1 className="px-4 py-6 text-2xl font-bold">Edit Church Member</h1>
			<form
				className="w-full flex flex-col p-4 space-y-2"
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				{members && churches && (
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
								onChange: ({ value, fieldApi }) => {
									const name = fieldApi.form.getFieldValue("name");

									if (!name || name === "") {
										return "Name must be filled for email to be filled.";
									}

									return value && !isEmailValid(value)
										? "Invalid email"
										: undefined;
								},
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
						<form.Field
							name="churchId"
							validators={{}}
							children={(field) => {
								// Avoid hasty abstractions. Render props are great!
								return (
									<>
										<div className="flex items-baseline flex-row space-x-4">
											<label
												className="w-36"
												htmlFor={field.name}
											>
												Church Name:
											</label>
											<Select
												onValueChange={field.handleChange}
												value={field.state.value}
												required
												// required
												// defaultValue={field.state.value.toString()}
											>
												<SelectTrigger className="min-w-xl p-2 border border-gray-400 rounded">
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
							<Button
								type="button"
								onClick={async () => await deleteChurchMember(Number(id!))}
								variant={"destructive"}
								className="w-36 rounded text-center items-center mt-4 p-3 shadow text-white"
							>
								Delete
							</Button>
						</div>

						<Button
							onClick={async () => await navigate("/church-members")}
							className="w-36 rounded text-center items-center p-3 mt-4 shadow border border-gray-300 text-primary"
							variant={"secondary"}
						>
							Back
						</Button>
					</div>
				)}
			</form>
		</div>
	);
}
