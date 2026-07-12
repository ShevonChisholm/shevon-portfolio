"use client";

import Link from "next/link";
import {
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  ArrowForward as ArrowForwardIcon,
  AttachMoneyOutlined as AttachMoneyOutlinedIcon,
  BusinessCenterOutlined as BusinessCenterOutlinedIcon,
  CreditCardOutlined as CreditCardOutlinedIcon,
  FlashOnOutlined as FlashOnOutlinedIcon,
  HandymanOutlined as HandymanOutlinedIcon,
  PhoneAndroidOutlined as PhoneAndroidOutlinedIcon,
  RocketLaunchOutlined as RocketLaunchOutlinedIcon,
  ScheduleOutlined as ScheduleOutlinedIcon,
  StorageOutlined as StorageOutlinedIcon,
  TaskAltOutlined as TaskAltOutlinedIcon,
} from "@mui/icons-material";
import { m as motion } from "framer-motion";
import {
  type PublicServicePackage,
  useListPublicServicePackagesQuery,
} from "@/lib/api/public-services-api";
import { publicContainerSx } from "@/theme/layout";

const fallbackPackages: PublicServicePackage[] = [
  {
    id: "starter",
    name: "Starter",
    slug: "starter",
    subtitle: "Professional Website",
    description:
      "Fast, professional websites that establish your online presence and convert visitors.",
    price_label: "JMD 65,000",
    timeline: "3-7 days",
  },
  {
    id: "growth",
    name: "Growth",
    slug: "growth",
    subtitle: "Business Website",
    description:
      "Full business websites with CMS, booking, payments, and lead capture built in.",
    price_label: "JMD 90,000",
    timeline: "1-3 weeks",
    is_featured: true,
  },
  {
    id: "scale",
    name: "Scale",
    slug: "scale",
    subtitle: "Business Automation",
    description:
      "Admin portals, dashboards, CRMs, and workflow automation that reduce manual work.",
    price_label: "JMD 250,000",
    timeline: "3-6 weeks",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    slug: "enterprise",
    subtitle: "Custom Software Solutions",
    description:
      "Custom platforms, marketplaces, APIs, and enterprise systems built to specification.",
    price_label: "Custom Quote",
    timeline: "Based on scope",
  },
];

const waysToWork = [
  {
    icon: <BusinessCenterOutlinedIcon />,
    label: "For Companies",
    title: "Hire Me as an Engineer",
    description:
      "For companies looking for full-time remote or contract engineering support.",
    href: "/resume",
    cta: "View Resume",
  },
  {
    icon: <HandymanOutlinedIcon />,
    label: "For Teams",
    title: "Contract Engineering Support",
    description:
      "For teams that need help with frontend, backend, mobile, APIs, integrations, or deployment.",
    href: "/#experience",
    cta: "View Experience",
  },
  {
    icon: <RocketLaunchOutlinedIcon />,
    label: "For Businesses",
    title: "Start a Business Project",
    description:
      "For business owners who need a website, dashboard, portal, automation workflow, or custom software.",
    href: "/start-project",
    cta: "Start Project",
    primary: true,
  },
];

const supportingSolutions = [
  {
    icon: <PhoneAndroidOutlinedIcon />,
    title: "Mobile Applications",
    description: "Cross-platform mobile apps for iOS and Android.",
  },
  {
    icon: <CreditCardOutlinedIcon />,
    title: "Payment Systems",
    description: "Stripe integrations, subscriptions, and invoicing.",
  },
  {
    icon: <StorageOutlinedIcon />,
    title: "Custom Platforms",
    description: "Booking systems, CRMs, and marketplaces.",
  },
  {
    icon: <FlashOnOutlinedIcon />,
    title: "API Integrations",
    description: "Connect services, automate workflows, sync data.",
  },
];

function SectionKicker({ children }: { children: React.ReactNode }) {
  const theme = useTheme();

  return (
    <Chip
      label={children}
      size="small"
      variant="outlined"
      sx={{
        height: 28,
        mb: 2,
        borderRadius: 4,
        color: "primary.main",
        borderColor: alpha(theme.palette.primary.main, 0.38),
        bgcolor: alpha(theme.palette.primary.main, 0.04),
        fontSize: "0.65rem",
        fontWeight: 800,
      }}
    />
  );
}

function formatPrice(packageItem: PublicServicePackage) {
  if (packageItem.price_label) return packageItem.price_label;
  if (typeof packageItem.starting_price === "number") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(packageItem.starting_price);
  }
  return "Custom Quote";
}

function sortedPackages(packages?: PublicServicePackage[]) {
  const source = packages?.length ? packages : fallbackPackages;
  return [...source]
    .sort((a, b) => (a.display_order ?? 999) - (b.display_order ?? 999))
    .slice(0, 4);
}

function WayCard({
  item,
  index,
}: {
  item: (typeof waysToWork)[number];
  index: number;
}) {
  const theme = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      style={{ height: "100%", minWidth: 0 }}
    >
      <Paper
        elevation={0}
        sx={{
          height: "100%",
          minHeight: 230,
          display: "flex",
          flexDirection: "column",
          p: { xs: 2.5, sm: 3 },
          borderRadius: 2,
          bgcolor: alpha(theme.palette.background.paper, 0.72),
          border: `1px solid ${
            item.primary
              ? alpha(theme.palette.primary.main, 0.42)
              : alpha(theme.palette.common.white, 0.11)
          }`,
          transition: "transform 180ms ease, border-color 180ms ease",
          "&:hover": {
            transform: "translateY(-4px)",
            borderColor: alpha(theme.palette.primary.main, 0.48),
          },
        }}
      >
        <Stack direction="row" spacing={1.4} sx={{ alignItems: "center", mb: 2 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              display: "grid",
              placeItems: "center",
              borderRadius: 1.4,
              color: "primary.main",
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              "& svg": { fontSize: 20 },
            }}
          >
            {item.icon}
          </Box>
          <Typography
            sx={{
              color: "text.secondary",
              fontSize: "0.6rem",
              fontWeight: 900,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            {item.label}
          </Typography>
        </Stack>
        <Typography
          component="h3"
          sx={{
            mb: 1.2,
            fontFamily: '"Montserrat", sans-serif',
            fontSize: "1rem",
            fontWeight: 900,
          }}
        >
          {item.title}
        </Typography>
        <Typography sx={{ flex: 1, color: "text.secondary", fontSize: "0.8rem", lineHeight: 1.65 }}>
          {item.description}
        </Typography>
        <Box sx={{ mt: 2.5, pt: 2, borderTop: `1px solid ${alpha(theme.palette.common.white, 0.08)}` }}>
          <Button
            component={Link}
            href={item.href}
            fullWidth
            variant={item.primary ? "contained" : "outlined"}
            endIcon={<ArrowForwardIcon />}
            sx={{
              minHeight: 36,
              borderColor: alpha(theme.palette.common.white, 0.16),
              color: item.primary ? "primary.contrastText" : "text.primary",
              "&:hover": {
                borderColor: "primary.main",
                color: item.primary ? "primary.contrastText" : "primary.main",
              },
            }}
          >
            {item.cta}
          </Button>
        </Box>
      </Paper>
    </motion.div>
  );
}

function PackageCard({
  item,
  index,
}: {
  item: PublicServicePackage;
  index: number;
}) {
  const theme = useTheme();
  const highlighted = Boolean(item.is_featured) || index === 1;
  const packageSlug = item.slug ?? item.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      style={{ height: "100%", minWidth: 0 }}
    >
      <Paper
        elevation={0}
        sx={{
          height: "100%",
          minHeight: 312,
          display: "flex",
          flexDirection: "column",
          p: { xs: 2.25, sm: 2.5 },
          borderRadius: 2,
          bgcolor: highlighted
            ? alpha(theme.palette.primary.main, 0.045)
            : alpha(theme.palette.background.paper, 0.72),
          border: `1px solid ${
            highlighted
              ? alpha(theme.palette.primary.main, 0.42)
              : alpha(theme.palette.common.white, 0.11)
          }`,
          transition: "transform 180ms ease, border-color 180ms ease",
          "&:hover": {
            transform: "translateY(-4px)",
            borderColor: alpha(theme.palette.primary.main, 0.48),
          },
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "space-between", mb: 1.6 }}>
          <Typography
            sx={{
              color: "primary.main",
              fontSize: "0.62rem",
              fontWeight: 900,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {item.name}
          </Typography>
          {highlighted && (
            <Chip
              label="Popular"
              size="small"
              sx={{
                height: 20,
                color: "primary.main",
                bgcolor: alpha(theme.palette.primary.main, 0.11),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.24)}`,
                fontSize: "0.55rem",
                fontWeight: 900,
                textTransform: "uppercase",
              }}
            />
          )}
        </Stack>
        <Typography
          component="h3"
          sx={{
            mb: 1.2,
            minHeight: "2.6em",
            fontFamily: '"Montserrat", sans-serif',
            fontSize: "0.98rem",
            lineHeight: 1.3,
            fontWeight: 900,
          }}
        >
          {item.subtitle || item.name}
        </Typography>
        <Typography sx={{ flex: 1, color: "text.secondary", fontSize: "0.78rem", lineHeight: 1.65 }}>
          {item.description || "A production-ready package scoped around the business workflow."}
        </Typography>
        <Stack spacing={1.1} sx={{ mt: 2.5, pt: 2, borderTop: `1px solid ${alpha(theme.palette.common.white, 0.08)}` }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <AttachMoneyOutlinedIcon sx={{ color: "text.secondary", fontSize: 16 }} />
            <Typography sx={{ fontSize: "0.78rem", fontWeight: 800 }}>
              {formatPrice(item)}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <ScheduleOutlinedIcon sx={{ color: "text.secondary", fontSize: 16 }} />
            <Typography sx={{ color: "text.secondary", fontSize: "0.76rem" }}>
              {item.timeline || "Based on scope"}
            </Typography>
          </Stack>
        </Stack>
        <Button
          component={Link}
          href={`/start-project?package=${encodeURIComponent(packageSlug)}`}
          variant="contained"
          fullWidth
          endIcon={<ArrowForwardIcon />}
          sx={{ mt: 2.25, minHeight: 36 }}
        >
          {item.cta_label || "Request Package"}
        </Button>
      </Paper>
    </motion.div>
  );
}

export default function HomePlatformSections() {
  const theme = useTheme();
  const packagesQuery = useListPublicServicePackagesQuery();
  const packages = sortedPackages(packagesQuery.data);

  return (
    <>
      <Box
        component="section"
        sx={{
          py: { xs: 8, md: 10 },
          width: "100%",
          minWidth: 0,
          overflow: "hidden",
          borderTop: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
          borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
        }}
      >
        <Container maxWidth="xl" sx={publicContainerSx}>
          <Box sx={{ textAlign: "center", maxWidth: 680, mx: "auto", mb: { xs: 4, md: 5.5 } }}>
            <SectionKicker>WAYS TO WORK WITH ME</SectionKicker>
            <Typography
              component="h2"
              sx={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: { xs: "2rem", md: "2.35rem" },
                lineHeight: 1.12,
                fontWeight: 900,
              }}
            >
              Two paths.{" "}
              <Box component="span" sx={{ color: "primary.main" }}>
                One engineer.
              </Box>
            </Typography>
            <Typography sx={{ mt: 1.5, color: "text.secondary", fontSize: "0.9rem", lineHeight: 1.65 }}>
              Whether you&apos;re hiring for a team or building a product from scratch, I bring the same production-grade engineering.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
              gridAutoRows: "1fr",
              gap: 2,
            }}
          >
            {waysToWork.map((item, index) => (
              <WayCard key={item.title} item={item} index={index} />
            ))}
          </Box>
        </Container>
      </Box>

      <Box
        component="section"
        id="solutions"
        sx={{
          position: "relative",
          py: { xs: 9, md: 12 },
          width: "100%",
          minWidth: 0,
          overflow: "hidden",
          bgcolor: alpha(theme.palette.background.paper, 0.12),
          borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
        }}
      >
        <Box
          aria-hidden="true"
          sx={{
            position: "absolute",
            top: -90,
            right: -70,
            width: 350,
            height: 350,
            borderRadius: "50%",
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            filter: "blur(90px)",
          }}
        />
        <Container maxWidth="xl" sx={{ ...publicContainerSx, position: "relative" }}>
          <Box sx={{ textAlign: "center", maxWidth: 720, mx: "auto", mb: { xs: 4.5, md: 6 } }}>
            <SectionKicker>BUSINESS SOLUTIONS</SectionKicker>
            <Typography
              component="h2"
              sx={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: { xs: "2rem", md: "2.45rem" },
                lineHeight: 1.12,
                fontWeight: 900,
              }}
            >
              From a website to a{" "}
              <Box component="span" sx={{ color: "primary.main" }}>
                full platform
              </Box>
            </Typography>
            <Typography sx={{ mt: 1.6, color: "text.secondary", fontSize: "0.9rem", lineHeight: 1.65 }}>
              Choose a package path. Each one is a production-ready system engineered for real business operations.
            </Typography>
          </Box>

          {packagesQuery.isLoading ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
                gap: 2,
                mb: { xs: 5, md: 6 },
              }}
            >
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} variant="rounded" height={312} />
              ))}
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" },
                gridAutoRows: "1fr",
                gap: 2,
                mb: { xs: 5, md: 6 },
              }}
            >
              {packages.map((item, index) => (
                <PackageCard key={item.id} item={item} index={index} />
              ))}
            </Box>
          )}

          <Box sx={{ pt: { xs: 4.5, md: 5 }, borderTop: `1px solid ${alpha(theme.palette.common.white, 0.08)}` }}>
            <Typography
              sx={{
                mb: 2.5,
                color: "text.secondary",
                textAlign: "center",
                fontSize: "0.64rem",
                fontWeight: 900,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Also specialised in
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" },
                gap: 1.5,
              }}
            >
              {supportingSolutions.map((solution) => (
                <Paper
                  key={solution.title}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 1.5,
                    bgcolor: alpha(theme.palette.background.paper, 0.72),
                    border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                  }}
                >
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      display: "grid",
                      placeItems: "center",
                      mb: 1.4,
                      borderRadius: 1,
                      color: "primary.main",
                      bgcolor: alpha(theme.palette.primary.main, 0.12),
                      "& svg": { fontSize: 17 },
                    }}
                  >
                    {solution.icon}
                  </Box>
                  <Typography sx={{ mb: 0.6, fontSize: "0.78rem", fontWeight: 900 }}>
                    {solution.title}
                  </Typography>
                  <Typography sx={{ color: "text.secondary", fontSize: "0.68rem", lineHeight: 1.5 }}>
                    {solution.description}
                  </Typography>
                </Paper>
              ))}
            </Box>
            <Box sx={{ mt: 4, textAlign: "center" }}>
              <Button
                component={Link}
                href="/services"
                variant="outlined"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  borderColor: alpha(theme.palette.common.white, 0.16),
                  color: "text.primary",
                  "&:hover": { borderColor: "primary.main", color: "primary.main" },
                }}
              >
                Compare All Packages
              </Button>
            </Box>
          </Box>

          {packagesQuery.isError && (
            <Stack direction="row" spacing={1} sx={{ justifyContent: "center", alignItems: "center", mt: 3, color: "text.secondary" }}>
              <TaskAltOutlinedIcon sx={{ color: "primary.main", fontSize: 16 }} />
              <Typography sx={{ fontSize: "0.72rem" }}>
                Showing default packages while the service catalog is unavailable.
              </Typography>
            </Stack>
          )}
        </Container>
      </Box>
    </>
  );
}
