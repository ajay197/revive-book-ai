import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCredits } from "@/contexts/CreditsContext";
import { LOW_BALANCE_THRESHOLD, BLOCK_CALLS_THRESHOLD } from "@/lib/credits";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, CreditCard } from "lucide-react";

export function LowCreditAlert() {
  const { balance, loading } = useCredits();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const isCritical = balance <= BLOCK_CALLS_THRESHOLD;
  const isLow = balance < LOW_BALANCE_THRESHOLD;

  useEffect(() => {
    if (loading || dismissed) return;
    if (isLow) setOpen(true);
  }, [loading, balance, dismissed, isLow]);

  if (!isLow || loading) return null;

  return (
    <AlertDialog open={open} onOpenChange={(v) => { if (!isCritical) setOpen(v); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <AlertDialogTitle className="text-center">
            {isCritical ? "No Credits Remaining" : "Low Credit Alert"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {isCritical
              ? "You do not have enough credits to make more calls. Please buy more credits."
              : `Your credits are below ${LOW_BALANCE_THRESHOLD}. Add more credits to continue making calls without interruption.`}
            <span className="mt-2 block font-semibold text-foreground">
              Current Balance: {balance.toFixed(2)} credits
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogAction
            onClick={() => { setOpen(false); navigate("/app/billing"); }}
            className="bg-gradient-primary"
          >
            <CreditCard className="mr-2 h-4 w-4" /> Add Credits
          </AlertDialogAction>
          <AlertDialogCancel onClick={() => { setDismissed(true); setOpen(false); }}>
            {isCritical ? "Close" : "Maybe Later"}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
