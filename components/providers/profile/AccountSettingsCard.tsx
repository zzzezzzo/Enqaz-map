"use client";

import { ShieldAlert } from "lucide-react";
import type { WorkshopProfileForm } from "@/app/providers/profile/types";

export type AccountSettingsCardProps = {
  form: WorkshopProfileForm;
  onChangePassword: () => void;
  onConfigureNotifications: () => void;
  onDeactivateAccount: () => void;
};

export default function AccountSettingsCard({
  onChangePassword,
  onConfigureNotifications,
  onDeactivateAccount,
}: AccountSettingsCardProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Account Settings</h3>

      <div className="mt-4 space-y-4">
        <div className="rounded-xl bg-slate-50 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-700">
                Change Password
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Update your account password
              </p>
            </div>
            <button
              type="button"
              onClick={onChangePassword}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Change
            </button>
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-700">
                Notification Settings
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Manage email and push notifications
              </p>
            </div>
            <button
              type="button"
              onClick={onConfigureNotifications}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Configure
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-full bg-red-100 p-2">
                <ShieldAlert className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-red-700">
                  Deactivate Account
                </p>
                <p className="mt-1 text-sm text-red-700">
                  Temporarily disable your workshop account
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onDeactivateAccount}
              className="rounded-lg border border-red-300 bg-white px-4 py-2 text-xs font-semibold text-red-600 shadow-sm hover:bg-red-100"
            >
              Deactivate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

