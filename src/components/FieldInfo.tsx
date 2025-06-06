import type { AnyFieldApi } from "@tanstack/react-form";

export function FieldInfo({ field }: { field: AnyFieldApi }) {
	return (
		<>
			{field.state.meta.isTouched && field.state.meta.errors.length ? (
				<em className="text-sm text-red-500">{field.state.meta.errors.join(", ")}</em>
			) : null}
		</>
	);
}
