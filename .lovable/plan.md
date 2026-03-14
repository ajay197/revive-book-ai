

## Plan: Map Lead Fields to Retell AI Dynamic Variables

### What changes
One file: `supabase/functions/campaign-caller/index.ts`

Update the `retell_llm_dynamic_variables` object (lines 281-287) to use the exact Retell variable names the user specified, and pass all available lead details:

```typescript
retell_llm_dynamic_variables: {
  // User-specified mappings
  Lead_Name: nextLead.name || "",
  Lead_Email: nextLead.email || "",
  Lead_Phone: nextLead.phone || "",
  // Additional lead details
  Lead_Company: nextLead.company || "",
  Lead_City: nextLead.city || "",
  Lead_State: nextLead.state || "",
  Lead_Source: nextLead.source || "",
  Lead_Tags: nextLead.tags || "",
  Lead_Notes: nextLead.notes || "",
  // Keep campaign context
  campaign_name: campaign.name,
  campaign_type: campaign.type,
},
```

This ensures all lead profile data is available as `{{Lead_Name}}`, `{{Lead_Email}}`, `{{Lead_Phone}}`, etc. in Retell AI agent scripts.

### Impact
- No database changes needed
- No UI changes needed
- Edge function will be auto-deployed

