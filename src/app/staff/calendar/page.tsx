"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useCurrentEmployee } from "@/lib/use-current-employee";
import { PageHeading } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { EmployeeSchedule } from "@/components/calendar/employee-schedule";
import { AppointmentEditorDialog } from "@/components/appointments/appointment-editor-dialog";

export default function StaffCalendarPage() {
  const employee = useCurrentEmployee();
  const [editorId, setEditorId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  if (!employee)
    return <EmptyState title="No specialist profile linked to this account." />;

  return (
    <div>
      <PageHeading
        title="My calendar"
        description="Only your own appointments — private to you."
        action={
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus size={15} /> New appointment
          </Button>
        }
      />
      <EmployeeSchedule
        employeeId={employee.id}
        onSelectAppointment={setEditorId}
        defaultMode="day"
        dayOffLabel="You're not scheduled to work this day."
      />

      <AppointmentEditorDialog
        open={!!editorId}
        appointmentId={editorId}
        onClose={() => setEditorId(null)}
      />
      <AppointmentEditorDialog
        open={creating}
        presets={{ employeeId: employee.id }}
        onClose={() => setCreating(false)}
      />
    </div>
  );
}
