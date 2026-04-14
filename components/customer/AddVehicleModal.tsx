"use client";

import type { Dispatch, SetStateAction } from "react";

export type CarDetails = {
  plate_number: string;
  model: string;
  brand: string;
};

export type AddVehicleModalProps = {
  open: boolean;
  onClose: () => void;
  car: CarDetails;
  setCar: Dispatch<SetStateAction<CarDetails>>;
  saving: boolean;
  error: string | null;
  onSave: () => void;
};

export default function AddVehicleModal({
  open,
  onClose,
  car,
  setCar,
  saving,
  error,
  onSave,
}: AddVehicleModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-slate-200">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Add your car details
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Needed to submit your next request.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-50 text-slate-500"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Plate Number
            </label>
            <input
              value={car.plate_number}
              onChange={(e) =>
                setCar((prev) => ({
                  ...prev,
                  plate_number: e.target.value,
                }))
              }
              placeholder="e.g. 187 راط"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Model
              </label>
              <input
                value={car.model}
                onChange={(e) =>
                  setCar((prev) => ({
                    ...prev,
                    model: e.target.value,
                  }))
                }
                placeholder="e.g. toyota crola"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white text-slate-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Brand / Year
              </label>
              <input
                value={car.brand}
                onChange={(e) =>
                  setCar((prev) => ({
                    ...prev,
                    brand: e.target.value,
                  }))
                }
                placeholder="e.g. 2009"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white text-slate-800"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>

        <div className="px-6 pb-6 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            disabled={saving}
          >
            Later
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving || !car.plate_number || !car.model || !car.brand}
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save car details"}
          </button>
        </div>
      </div>
    </div>
  );
}

