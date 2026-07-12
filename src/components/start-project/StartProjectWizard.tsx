"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  Chip,
  Container,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { SvgIconComponent } from "@mui/icons-material";
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  AssignmentOutlined as AssignmentOutlinedIcon,
  BoltOutlined as BoltOutlinedIcon,
  BusinessOutlined as BusinessOutlinedIcon,
  Check as CheckIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  DescriptionOutlined as DescriptionOutlinedIcon,
  GroupsOutlined as GroupsOutlinedIcon,
  ListAltOutlined as ListAltOutlinedIcon,
  MonetizationOnOutlined as MonetizationOnOutlinedIcon,
  RocketLaunchOutlined as RocketLaunchOutlinedIcon,
  SendOutlined as SendOutlinedIcon,
  SettingsOutlined as SettingsOutlinedIcon,
  TrendingUpOutlined as TrendingUpOutlinedIcon,
} from "@mui/icons-material";
import { AnimatePresence, m } from "framer-motion";
import {
  type PublicServicePackage,
  useListPublicServicePackagesQuery,
  useStartProjectMutation,
} from "@/lib/api/public-services-api";
import { publicContainerSx } from "@/theme/layout";
import {
  budgetOptions,
  customPackageValue,
  featureOptions,
  timelineOptions,
} from "./project-inquiry-options";

type ProjectInquiryForm = {
  package_slug: string;
  full_name: string;
  business_name: string;
  email: string;
  phone: string;
  industry: string;
  current_website_url: string;
  project_goals: string;
  problem_to_solve: string;
  features_needed: string[];
  budget_range: string;
  desired_timeline: string;
  additional_notes: string;
};

const wizardSteps: Array<{ label: string; icon: SvgIconComponent }> = [
  { label: "Choose Package", icon: BusinessOutlinedIcon },
  { label: "Business Info", icon: GroupsOutlinedIcon },
  { label: "Project Goals", icon: RocketLaunchOutlinedIcon },
  { label: "Features", icon: ListAltOutlinedIcon },
  { label: "Budget & Timeline", icon: MonetizationOnOutlinedIcon },
  { label: "Review & Submit", icon: AssignmentOutlinedIcon },
];

const tierIcons: Record<string, SvgIconComponent> = {
  starter: BoltOutlinedIcon,
  growth: TrendingUpOutlinedIcon,
  scale: SettingsOutlinedIcon,
  enterprise: BusinessOutlinedIcon,
};

function optional(value: string) {
  const trimmed = value.trim();
  return trimmed || undefined;
}

function apiErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "data" in error) {
    const data = error.data as { message?: unknown; error?: unknown };
    if (typeof data.message === "string") return data.message;
    if (Array.isArray(data.message)) return data.message.join(" ");
    if (typeof data.error === "string") return data.error;
  }
  return "Your inquiry could not be submitted. Please try again.";
}

function packageTier(item: PublicServicePackage) {
  const source = `${item.package_type ?? ""} ${item.slug ?? ""} ${item.name ?? ""}`.toLowerCase();
  return Object.keys(tierIcons).find((tier) => source.includes(tier)) ?? "starter";
}

function packagePrice(item: PublicServicePackage) {
  if (item.price_label) return item.price_label;
  if (typeof item.starting_price !== "number") return "Custom quote";
  return new Intl.NumberFormat("en-JM", {
    style: "currency",
    currency: "JMD",
    maximumFractionDigits: 0,
  }).format(item.starting_price);
}

function StepIntro({ title, description }: { title: string; description: string }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography component="h2" sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: "1.3rem", fontWeight: 900 }}>
        {title}
      </Typography>
      <Typography sx={{ color: "text.secondary", fontSize: "0.88rem", mt: 0.6 }}>
        {description}
      </Typography>
    </Box>
  );
}

function WizardProgress({ currentStep }: { currentStep: number }) {
  const theme = useTheme();

  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", mb: { xs: 4, md: 5 } }}>
      {wizardSteps.map((step, index) => {
        const number = index + 1;
        const complete = currentStep > number;
        const active = currentStep >= number;
        const Icon = step.icon;

        return (
          <Box key={step.label} sx={{ position: "relative", flex: 1, minWidth: 0, textAlign: "center" }}>
            {index < wizardSteps.length - 1 && (
              <Box data-wizard-connector sx={{ position: "absolute", top: 18, left: "calc(50% + 20px)", right: "calc(-50% + 20px)", height: "1px", bgcolor: active && currentStep > number ? "primary.main" : alpha(theme.palette.text.secondary, 0.24), transition: "background-color 220ms ease" }} />
            )}
            <Box sx={{ position: "relative", zIndex: 1, width: 36, height: 36, mx: "auto", display: "grid", placeItems: "center", borderRadius: "50%", color: active ? "primary.contrastText" : "text.secondary", bgcolor: active ? "primary.main" : "background.paper", border: `1px solid ${active ? theme.palette.primary.main : alpha(theme.palette.text.secondary, 0.3)}`, transition: "all 220ms ease" }}>
              {complete ? <CheckIcon sx={{ fontSize: 18 }} /> : <Typography sx={{ fontSize: "0.75rem", fontWeight: 900 }}>{number}</Typography>}
            </Box>
            <Typography sx={{ display: { xs: "none", sm: "block" }, color: active ? "primary.main" : "text.secondary", fontSize: "0.62rem", fontWeight: active ? 800 : 600, mt: 0.8, px: 0.5 }}>
              {step.label}
            </Typography>
            <Icon sx={{ display: { xs: "block", sm: "none" }, color: active ? "primary.main" : "text.secondary", fontSize: 14, mx: "auto", mt: 0.7 }} />
          </Box>
        );
      })}
    </Box>
  );
}

function PackageChoice({ item, selected, onSelect }: { item: PublicServicePackage; selected: boolean; onSelect: () => void }) {
  const theme = useTheme();
  const Icon = tierIcons[packageTier(item)];

  return (
    <ButtonBase
      onClick={onSelect}
      sx={{ width: "100%", height: "100%", display: "block", textAlign: "left", p: 2.5, borderRadius: 1, border: `1px solid ${selected ? theme.palette.primary.main : alpha(theme.palette.common.white, 0.12)}`, bgcolor: selected ? alpha(theme.palette.primary.main, 0.08) : alpha(theme.palette.background.paper, 0.62), transition: "border-color 160ms ease, background-color 160ms ease", "&:hover": { borderColor: alpha(theme.palette.primary.main, 0.48) } }}
    >
      <Stack direction="row" spacing={1.3} sx={{ alignItems: "center", mb: 1.5 }}>
        <Box sx={{ width: 36, height: 36, display: "grid", placeItems: "center", borderRadius: 1, color: "primary.main", bgcolor: alpha(theme.palette.primary.main, selected ? 0.18 : 0.1), flexShrink: 0 }}>
          <Icon sx={{ fontSize: 18 }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontWeight: 900, fontSize: "0.9rem" }}>{item.name}</Typography>
          {item.subtitle && <Typography sx={{ color: "primary.main", fontSize: "0.7rem", mt: 0.2 }}>{item.subtitle}</Typography>}
        </Box>
        {selected && <CheckCircleOutlineIcon sx={{ color: "primary.main" }} />}
      </Stack>
      <Typography sx={{ fontWeight: 900, fontSize: "0.86rem" }}>{packagePrice(item)}</Typography>
      {item.timeline && <Typography sx={{ color: "text.secondary", fontSize: "0.72rem", mt: 0.35 }}>{item.timeline}</Typography>}
    </ButtonBase>
  );
}

function SelectableOption({ label, selected, onClick, radio = false }: { label: string; selected: boolean; onClick: () => void; radio?: boolean }) {
  const theme = useTheme();
  return (
    <ButtonBase onClick={onClick} sx={{ width: "100%", minHeight: 46, justifyContent: "flex-start", gap: 1.2, p: 1.4, borderRadius: 1, border: `1px solid ${selected ? theme.palette.primary.main : alpha(theme.palette.common.white, 0.12)}`, color: selected ? "text.primary" : "text.secondary", bgcolor: selected ? alpha(theme.palette.primary.main, 0.08) : alpha(theme.palette.background.paper, 0.55), textAlign: "left", fontSize: "0.82rem", "&:hover": { borderColor: alpha(theme.palette.primary.main, 0.45) } }}>
      <Box sx={{ width: 17, height: 17, display: "grid", placeItems: "center", flexShrink: 0, borderRadius: radio ? "50%" : 0.5, border: `1px solid ${selected ? theme.palette.primary.main : alpha(theme.palette.text.secondary, 0.45)}`, bgcolor: selected ? "primary.main" : "transparent" }}>
        {selected && !radio && <CheckIcon sx={{ color: "primary.contrastText", fontSize: 12 }} />}
      </Box>
      {label}
    </ButtonBase>
  );
}

function ReviewRow({ label, value }: { label: string; value?: string }) {
  const theme = useTheme();
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "150px minmax(0, 1fr)" }, gap: { xs: 0.5, sm: 2 }, p: 1.5, bgcolor: alpha(theme.palette.background.default, 0.48), border: `1px solid ${alpha(theme.palette.common.white, 0.06)}` }}>
      <Typography sx={{ color: "text.secondary", fontSize: "0.75rem", fontWeight: 700 }}>{label}</Typography>
      <Typography sx={{ fontSize: "0.84rem", overflowWrap: "anywhere" }}>{value || "-"}</Typography>
    </Box>
  );
}

export default function StartProjectWizard() {
  const theme = useTheme();
  const searchParams = useSearchParams();
  const initialPackage = searchParams.get("package") ?? "";
  const packagesQuery = useListPublicServicePackagesQuery();
  const [startProject, startProjectState] = useStartProjectMutation();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ProjectInquiryForm>({
    package_slug: initialPackage,
    full_name: "",
    business_name: "",
    email: "",
    phone: "",
    industry: "",
    current_website_url: "",
    project_goals: "",
    problem_to_solve: "",
    features_needed: [],
    budget_range: "",
    desired_timeline: "",
    additional_notes: "",
  });

  const packages = useMemo(
    () => [...(packagesQuery.data ?? [])].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)),
    [packagesQuery.data]
  );
  const selectedPackage = packages.find((item) => (item.slug ?? item.id) === form.package_slug);

  const updateField = <K extends keyof ProjectInquiryForm>(key: K, value: ProjectInquiryForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const toggleFeature = (feature: string) => {
    setForm((current) => ({
      ...current,
      features_needed: current.features_needed.includes(feature)
        ? current.features_needed.filter((item) => item !== feature)
        : [...current.features_needed, feature],
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return form.package_slug === customPackageValue || Boolean(selectedPackage);
      case 2:
        return Boolean(form.full_name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()));
      case 3:
        return Boolean(form.project_goals.trim() || form.problem_to_solve.trim());
      case 4:
        return form.features_needed.length > 0;
      case 5:
        return Boolean(form.budget_range && form.desired_timeline);
      default:
        return true;
    }
  };

  const submit = async () => {
    setError(null);
    try {
      await startProject({
        full_name: form.full_name.trim(),
        business_name: optional(form.business_name),
        email: form.email.trim(),
        phone: optional(form.phone),
        industry: optional(form.industry),
        current_website_url: optional(form.current_website_url),
        package_slug: form.package_slug === customPackageValue ? undefined : optional(form.package_slug),
        source: "portfolio-start-project",
        budget_range: form.budget_range,
        desired_timeline: form.desired_timeline,
        project_goals: optional(form.project_goals),
        problem_to_solve: optional(form.problem_to_solve),
        features_needed: form.features_needed,
        additional_notes: optional(form.additional_notes),
      }).unwrap();
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (submissionError) {
      setError(apiErrorMessage(submissionError));
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (currentStep < wizardSteps.length) {
      if (canProceed()) setCurrentStep((step) => step + 1);
      return;
    }
    void submit();
  };

  if (submitted) {
    return (
      <Box component="section" sx={{ minHeight: "82svh", pt: { xs: 15, md: 17 }, pb: 10, display: "grid", placeItems: "center" }}>
        <Container maxWidth="xl" sx={publicContainerSx}>
          <m.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
            <Box sx={{ maxWidth: 620, mx: "auto", textAlign: "center" }}>
              <Box sx={{ width: 66, height: 66, display: "grid", placeItems: "center", borderRadius: "50%", mx: "auto", mb: 3, color: "primary.main", bgcolor: alpha(theme.palette.primary.main, 0.12) }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 34 }} />
              </Box>
              <Typography component="h1" sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: { xs: "2rem", md: "2.6rem" }, fontWeight: 900 }}>Project inquiry submitted</Typography>
              <Typography sx={{ color: "text.secondary", mt: 1.5, lineHeight: 1.75 }}>Your project details are now in the CRM. I&apos;ll review the scope and follow up with the next practical step.</Typography>
              <Typography sx={{ color: "primary.main", fontSize: "0.85rem", fontWeight: 800, mt: 1.2 }}>Package interest: {selectedPackage?.name || "Custom scope"}</Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ justifyContent: "center", mt: 4 }}>
                <Button component={Link} href="/" variant="contained">Back to Home</Button>
                <Button component={Link} href="/services" variant="outlined">View Services</Button>
              </Stack>
            </Box>
          </m.div>
        </Container>
      </Box>
    );
  }

  return (
    <Box component="section" sx={{ pt: { xs: 14, md: 16 }, pb: { xs: 8, md: 11 } }}>
      <Container maxWidth="xl" sx={publicContainerSx}>
        <Box sx={{ maxWidth: 980, mx: "auto" }}>
          <Box sx={{ textAlign: "center", maxWidth: 720, mx: "auto", mb: 4 }}>
            <Typography sx={{ color: "primary.main", fontSize: "0.68rem", fontWeight: 900, letterSpacing: "0.14em", mb: 1 }}>START A PROJECT</Typography>
            <Typography component="h1" sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: { xs: "2.2rem", md: "3.1rem" }, fontWeight: 900, lineHeight: 1.05 }}>Project <Box component="span" sx={{ color: "primary.main" }}>Inquiry Wizard</Box></Typography>
            <Typography sx={{ color: "text.secondary", mt: 1.4, lineHeight: 1.7 }}>Tell me about your project and I&apos;ll follow up within 24 hours.</Typography>
          </Box>

          <WizardProgress currentStep={currentStep} />

          <Paper component="form" onSubmit={handleSubmit} elevation={0} sx={{ p: { xs: 2.2, sm: 3.5 }, minHeight: 500, border: `1px solid ${alpha(theme.palette.common.white, 0.12)}`, bgcolor: alpha(theme.palette.background.paper, 0.82), overflow: "hidden" }}>
            {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}
            {packagesQuery.isError && currentStep === 1 && <Alert severity="warning" sx={{ mb: 2.5 }}>Published packages could not be loaded. You can still choose a custom scope.</Alert>}

            <AnimatePresence mode="wait">
              <m.div key={currentStep} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.24 }}>
                {currentStep === 1 && (
                  <Box>
                    <StepIntro title="Choose your package" description="Select the package you are most interested in. This can be adjusted after discovery." />
                    {packagesQuery.isLoading ? (
                      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: 1.5 }}>{[0, 1, 2, 3].map((item) => <Skeleton key={item} variant="rounded" height={150} />)}</Box>
                    ) : (
                      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: 1.5 }}>
                        {packages.map((item) => <PackageChoice key={item.id} item={item} selected={form.package_slug === (item.slug ?? item.id)} onSelect={() => updateField("package_slug", item.slug ?? item.id)} />)}
                        <ButtonBase onClick={() => updateField("package_slug", customPackageValue)} sx={{ width: "100%", display: "block", textAlign: "left", p: 2.5, borderRadius: 1, border: `1px solid ${form.package_slug === customPackageValue ? theme.palette.primary.main : alpha(theme.palette.common.white, 0.12)}`, bgcolor: form.package_slug === customPackageValue ? alpha(theme.palette.primary.main, 0.08) : alpha(theme.palette.background.paper, 0.62) }}>
                          <Stack direction="row" spacing={1.3} sx={{ alignItems: "center" }}><Box sx={{ width: 36, height: 36, display: "grid", placeItems: "center", borderRadius: 1, color: "primary.main", bgcolor: alpha(theme.palette.primary.main, 0.1) }}><DescriptionOutlinedIcon sx={{ fontSize: 18 }} /></Box><Box sx={{ flex: 1 }}><Typography sx={{ fontWeight: 900, fontSize: "0.9rem" }}>Custom / Not sure yet</Typography><Typography sx={{ color: "text.secondary", fontSize: "0.72rem", mt: 0.3 }}>We&apos;ll identify the right scope during discovery.</Typography></Box>{form.package_slug === customPackageValue && <CheckCircleOutlineIcon sx={{ color: "primary.main" }} />}</Stack>
                        </ButtonBase>
                      </Box>
                    )}
                  </Box>
                )}

                {currentStep === 2 && (
                  <Box>
                    <StepIntro title="Business information" description="Tell me about yourself and your business." />
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: 2 }}>
                      <TextField label="Full name" required value={form.full_name} onChange={(event) => updateField("full_name", event.target.value)} slotProps={{ htmlInput: { maxLength: 120 } }} />
                      <TextField label="Business name" value={form.business_name} onChange={(event) => updateField("business_name", event.target.value)} slotProps={{ htmlInput: { maxLength: 160 } }} />
                      <TextField label="Email" type="email" required value={form.email} onChange={(event) => updateField("email", event.target.value)} slotProps={{ htmlInput: { maxLength: 254 } }} />
                      <TextField label="Phone / WhatsApp" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} slotProps={{ htmlInput: { maxLength: 80 } }} />
                      <TextField label="Industry" value={form.industry} onChange={(event) => updateField("industry", event.target.value)} slotProps={{ htmlInput: { maxLength: 160 } }} />
                      <TextField label="Current website / social media" value={form.current_website_url} onChange={(event) => updateField("current_website_url", event.target.value)} slotProps={{ htmlInput: { maxLength: 2048 } }} />
                    </Box>
                  </Box>
                )}

                {currentStep === 3 && (
                  <Box>
                    <StepIntro title="Project goals" description="What are you trying to achieve with this project?" />
                    <Stack spacing={2}>
                      <TextField label="What are your project goals?" value={form.project_goals} onChange={(event) => updateField("project_goals", event.target.value)} minRows={4} multiline fullWidth />
                      <TextField label="What problem are you trying to solve?" value={form.problem_to_solve} onChange={(event) => updateField("problem_to_solve", event.target.value)} minRows={4} multiline fullWidth />
                    </Stack>
                  </Box>
                )}

                {currentStep === 4 && (
                  <Box>
                    <StepIntro title="Features needed" description={`Select the capabilities you expect to need. ${form.features_needed.length} selected.`} />
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: 1 }}>
                      {featureOptions.map((feature) => <SelectableOption key={feature} label={feature} selected={form.features_needed.includes(feature)} onClick={() => toggleFeature(feature)} />)}
                    </Box>
                  </Box>
                )}

                {currentStep === 5 && (
                  <Box>
                    <StepIntro title="Budget & timeline" description="This helps me recommend the right delivery approach." />
                    <Typography sx={{ fontWeight: 850, fontSize: "0.8rem", mb: 1.2 }}>Budget range</Typography>
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: 1, mb: 3 }}>
                      {budgetOptions.map((option) => <SelectableOption key={option} label={option} radio selected={form.budget_range === option} onClick={() => updateField("budget_range", option)} />)}
                    </Box>
                    <Typography sx={{ fontWeight: 850, fontSize: "0.8rem", mb: 1.2 }}>Desired timeline</Typography>
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: 1, mb: 3 }}>
                      {timelineOptions.map((option) => <SelectableOption key={option} label={option} radio selected={form.desired_timeline === option} onClick={() => updateField("desired_timeline", option)} />)}
                    </Box>
                    <TextField label="Additional notes" value={form.additional_notes} onChange={(event) => updateField("additional_notes", event.target.value)} minRows={3} multiline fullWidth />
                  </Box>
                )}

                {currentStep === 6 && (
                  <Box>
                    <StepIntro title="Review & submit" description="Please review the project details before submitting." />
                    <Stack spacing={1}>
                      <ReviewRow label="Package" value={selectedPackage?.name || "Custom scope"} />
                      <ReviewRow label="Name" value={form.full_name} />
                      <ReviewRow label="Business" value={form.business_name} />
                      <ReviewRow label="Email" value={form.email} />
                      <ReviewRow label="Phone" value={form.phone} />
                      <ReviewRow label="Industry" value={form.industry} />
                      <ReviewRow label="Current website" value={form.current_website_url} />
                      <ReviewRow label="Project goals" value={form.project_goals} />
                      <ReviewRow label="Problem to solve" value={form.problem_to_solve} />
                      <ReviewRow label="Features needed" value={form.features_needed.join(", ")} />
                      <ReviewRow label="Budget" value={form.budget_range} />
                      <ReviewRow label="Timeline" value={form.desired_timeline} />
                      <ReviewRow label="Additional notes" value={form.additional_notes} />
                    </Stack>
                  </Box>
                )}
              </m.div>
            </AnimatePresence>

            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mt: 4, pt: 2.5, borderTop: `1px solid ${alpha(theme.palette.common.white, 0.1)}` }}>
              <Button component={currentStep === 1 ? Link : "button"} href={currentStep === 1 ? "/services" : undefined} type="button" color="inherit" startIcon={<ArrowBackIcon />} onClick={currentStep > 1 ? () => setCurrentStep((step) => step - 1) : undefined} sx={{ color: "text.secondary" }}>
                {currentStep === 1 ? "Cancel" : "Back"}
              </Button>
              {currentStep < wizardSteps.length ? (
                <Button type="button" variant="contained" endIcon={<ArrowForwardIcon />} disabled={!canProceed()} onClick={() => setCurrentStep((step) => step + 1)}>Continue</Button>
              ) : (
                <Button type="submit" variant="contained" startIcon={<SendOutlinedIcon />} disabled={startProjectState.isLoading}>{startProjectState.isLoading ? "Submitting..." : "Submit Inquiry"}</Button>
              )}
            </Stack>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}
