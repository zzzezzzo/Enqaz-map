import type { RolePermissionDefinition } from "./types";

type Props = {
  definition: RolePermissionDefinition;
};

export function AdminAccountPermissionCard({ definition }: Props) {
  return (
    <div
      className={`rounded-xl border p-4 shadow-sm ${definition.className}`}
    >
      <h3 className="text-sm font-bold text-slate-900">{definition.title}</h3>
      <ul className="mt-3 list-disc space-y-1.5 pl-4 text-sm text-slate-700">
        {definition.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
