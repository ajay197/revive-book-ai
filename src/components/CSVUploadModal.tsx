import { useState, useCallback, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, X, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const LEAD_FIELDS = [
  { value: "skip", label: "— Skip this column —" },
  { value: "name", label: "Name", required: true },
  { value: "phone", label: "Phone", required: true },
  { value: "email", label: "Email" },
  { value: "company", label: "Company" },
  { value: "city", label: "City" },
  { value: "state", label: "State" },
  { value: "source", label: "Source" },
  { value: "tags", label: "Tags" },
  { value: "notes", label: "Notes" },
];

type Step = "upload" | "preview" | "mapping" | "confirm";

interface CSVUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport?: (data: Record<string, string>[]) => void;
}

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows = lines.slice(1).map((line) =>
    line.split(",").map((cell) => cell.trim().replace(/^"|"$/g, ""))
  );
  return { headers, rows };
}

function autoMapColumns(headers: string[]): Record<number, string> {
  const mapping: Record<number, string> = {};
  const synonyms: Record<string, string[]> = {
    name: ["name", "full_name", "fullname", "contact", "lead_name", "contact_name"],
    phone: ["phone", "phone_number", "mobile", "cell", "telephone", "tel"],
    email: ["email", "email_address", "e-mail", "mail"],
    company: ["company", "business", "organization", "org", "company_name"],
    city: ["city", "town"],
    state: ["state", "province", "region"],
    source: ["source", "lead_source", "origin"],
    tags: ["tags", "tag", "labels"],
    notes: ["notes", "note", "comments", "comment"],
  };
  headers.forEach((h, i) => {
    const lower = h.toLowerCase().replace(/[\s_-]+/g, "_");
    for (const [field, keys] of Object.entries(synonyms)) {
      if (keys.includes(lower)) {
        mapping[i] = field;
        return;
      }
    }
    mapping[i] = "skip";
  });
  return mapping;
}

export function CSVUploadModal({ open, onOpenChange, onImport }: CSVUploadModalProps) {
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<number, string>>({});
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep("upload");
    setFile(null);
    setHeaders([]);
    setRows([]);
    setColumnMapping({});
    setIsDragging(false);
  };

  const handleClose = (val: boolean) => {
    if (!val) reset();
    onOpenChange(val);
  };

  const processFile = useCallback((f: File) => {
    if (!f.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10 MB");
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { headers: h, rows: r } = parseCSV(text);
      if (h.length === 0) {
        toast.error("Could not parse CSV headers");
        return;
      }
      setHeaders(h);
      setRows(r);
      setColumnMapping(autoMapColumns(h));
      setStep("preview");
    };
    reader.readAsText(f);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) processFile(f);
    },
    [processFile]
  );

  const mappedRequiredFields = LEAD_FIELDS.filter((f) => f.required).map((f) => f.value);
  const mappedValues = Object.values(columnMapping);
  const missingRequired = mappedRequiredFields.filter((f) => !mappedValues.includes(f));

  const phoneRegex = /^\+\d[\d\s()-]{7,}$/;

  const getValidationErrors = () => {
    const phoneColIndex = Object.entries(columnMapping).find(([, v]) => v === "phone")?.[0];
    const nameColIndex = Object.entries(columnMapping).find(([, v]) => v === "name")?.[0];
    let emptyCount = 0;
    let invalidPhoneCount = 0;

    rows.forEach((row) => {
      if (nameColIndex !== undefined && !row[Number(nameColIndex)]?.trim()) emptyCount++;
      if (phoneColIndex !== undefined) {
        const phone = row[Number(phoneColIndex)]?.trim();
        if (!phone) emptyCount++;
        else if (!phoneRegex.test(phone)) invalidPhoneCount++;
      }
    });
    return { emptyCount, invalidPhoneCount };
  };

  const validationErrors = step === "confirm" ? getValidationErrors() : { emptyCount: 0, invalidPhoneCount: 0 };

  const handleImport = () => {
    const mapped = rows.map((row) => {
      const obj: Record<string, string> = {};
      headers.forEach((_, i) => {
        const field = columnMapping[i];
        if (field && field !== "skip") {
          obj[field] = row[i] || "";
        }
      });
      return obj;
    });
    const valid = mapped.filter((r) => r.name?.trim() && r.phone?.trim() && phoneRegex.test(r.phone.trim()));
    const skipped = mapped.length - valid.length;
    onImport?.(valid);
    toast.success(`${valid.length} leads imported${skipped > 0 ? ` (${skipped} skipped — invalid or empty)` : ""}`);
    handleClose(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="font-display text-lg font-bold text-foreground">
            {step === "upload" && "Upload Leads"}
            {step === "preview" && "Preview Data"}
            {step === "mapping" && "Map Columns"}
            {step === "confirm" && "Confirm Import"}
          </DialogTitle>
          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-3">
            {(["upload", "preview", "mapping", "confirm"] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full transition-colors ${
                    step === s
                      ? "bg-primary"
                      : (["upload", "preview", "mapping", "confirm"] as Step[]).indexOf(step) > i
                      ? "bg-primary/40"
                      : "bg-muted-foreground/20"
                  }`}
                />
                {i < 3 && <div className="h-px w-6 bg-border" />}
              </div>
            ))}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* STEP 1 — Upload */}
          {step === "upload" && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-12 cursor-pointer transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/20 hover:border-primary/40 hover:bg-muted/50"
              }`}
            >
              <div className="rounded-full bg-primary/10 p-4">
                <Upload className="h-7 w-7 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-medium text-foreground">
                  Drag & drop your CSV file here
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  or click to browse · CSV up to 10 MB
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Phone numbers must include country code (e.g. +1 555-123-4567)
                </p>
              </div>
              <a
                href="/sample-leads.csv"
                download="sample-leads.csv"
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
              >
                Download sample CSV
              </a>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) processFile(f);
                }}
              />
            </div>
          )}

          {/* STEP 2 — Preview */}
          {step === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-4 py-3">
                <FileText className="h-5 w-5 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{file?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {rows.length} rows · {headers.length} columns
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={reset}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="rounded-lg border overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted/40">
                      {headers.map((h, i) => (
                        <th key={i} className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 5).map((row, ri) => (
                      <tr key={ri} className="border-t">
                        {row.map((cell, ci) => (
                          <td key={ci} className="px-3 py-2 text-foreground whitespace-nowrap max-w-[200px] truncate">
                            {cell || <span className="text-muted-foreground/40">—</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {rows.length > 5 && (
                <p className="text-xs text-muted-foreground text-center">
                  Showing 5 of {rows.length} rows
                </p>
              )}
            </div>
          )}

          {/* STEP 3 — Column Mapping */}
          {step === "mapping" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Map each CSV column to a lead field. <span className="text-primary font-medium">Name</span> and{" "}
                <span className="text-primary font-medium">Phone</span> are required.
              </p>
              <div className="space-y-3">
                {headers.map((h, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0 rounded-lg bg-muted/50 px-3 py-2.5">
                      <p className="text-sm font-medium text-foreground truncate">{h}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        e.g. {rows[0]?.[i] || "—"}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    <Select
                      value={columnMapping[i] || "skip"}
                      onValueChange={(val) =>
                        setColumnMapping((prev) => ({ ...prev, [i]: val }))
                      }
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LEAD_FIELDS.map((f) => (
                          <SelectItem key={f.value} value={f.value}>
                            {f.label}
                            {f.required ? " *" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
              {missingRequired.length > 0 && (
                <div className="flex items-start gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>
                    Required fields not mapped:{" "}
                    <strong>{missingRequired.join(", ")}</strong>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* STEP 4 — Confirm */}
          {step === "confirm" && (
            <div className="flex flex-col items-center gap-5 py-6">
              <div className="rounded-full bg-[hsl(var(--success))]/10 p-4">
                <CheckCircle2 className="h-8 w-8 text-[hsl(var(--success))]" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-foreground">Ready to import</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {rows.length} leads from <strong>{file?.name}</strong>
                </p>
              </div>
              <div className="w-full max-w-xs space-y-2">
                {LEAD_FIELDS.filter((f) => f.value !== "skip" && mappedValues.includes(f.value)).map(
                  (f) => (
                    <div key={f.value} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{f.label}</span>
                      <CheckCircle2 className="h-4 w-4 text-[hsl(var(--success))]" />
                    </div>
                  )
                )}
              </div>
              {(validationErrors.emptyCount > 0 || validationErrors.invalidPhoneCount > 0) && (
                <div className="flex items-start gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <div>
                    {validationErrors.emptyCount > 0 && (
                      <p>{validationErrors.emptyCount} row(s) have empty required fields — will be skipped</p>
                    )}
                    {validationErrors.invalidPhoneCount > 0 && (
                      <p>{validationErrors.invalidPhoneCount} row(s) have invalid phone numbers (must start with + country code) — will be skipped</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== "upload" && (
          <div className="flex items-center justify-between border-t px-6 py-4 bg-muted/30">
            <Button
              variant="ghost"
              onClick={() => {
                if (step === "preview") reset();
                else if (step === "mapping") setStep("preview");
                else if (step === "confirm") setStep("mapping");
              }}
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back
            </Button>
            {step === "preview" && (
              <Button onClick={() => setStep("mapping")} className="bg-gradient-primary">
                Map Columns <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            )}
            {step === "mapping" && (
              <Button
                onClick={() => setStep("confirm")}
                disabled={missingRequired.length > 0}
                className="bg-gradient-primary"
              >
                Continue <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            )}
            {step === "confirm" && (
              <Button onClick={handleImport} className="bg-gradient-primary">
                Import {rows.length} Leads
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
