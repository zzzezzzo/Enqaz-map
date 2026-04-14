"use client";

import AddVehicleModal, {
  type AddVehicleModalProps,
} from "@/components/customer/AddVehicleModal";
import { useAddVehicleModal } from "@/app/customer/useAddVehicleModal";

export default function AddVehicleModalContainer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { mounted, car, setCar, saving, error, handleSave } =
    useAddVehicleModal({ open, onClose });

  if (!mounted) return null;

  return (
    <AddVehicleModal
      open={open}
      onClose={onClose}
      car={car}
      setCar={setCar}
      saving={saving}
      error={error}
      onSave={handleSave}
    />
  );
}

