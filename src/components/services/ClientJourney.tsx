"use client";

import {
  Box,
  Container,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  CheckCircleOutline as CheckCircleOutlineIcon,
  DescriptionOutlined as DescriptionOutlinedIcon,
  FactCheckOutlined as FactCheckOutlinedIcon,
  GroupsOutlined as GroupsOutlinedIcon,
  RocketLaunchOutlined as RocketLaunchOutlinedIcon,
  SearchOutlined as SearchOutlinedIcon,
  SupportAgentOutlined as SupportAgentOutlinedIcon,
  VisibilityOutlined as VisibilityOutlinedIcon,
} from "@mui/icons-material";
import { m } from "framer-motion";
import { publicContainerSx } from "@/theme/layout";

const journeySteps = [
  {
    icon: SearchOutlinedIcon,
    title: "Inquiry",
    description: "You submit a project request. I review your goals and reach out within 24 hours.",
  },
  {
    icon: VisibilityOutlinedIcon,
    title: "Discovery",
    description: "We discuss your business, needs, and vision, then shape the right recommendation.",
  },
  {
    icon: DescriptionOutlinedIcon,
    title: "Proposal",
    description: "You receive a detailed proposal with scope, timeline, milestones, and investment.",
  },
  {
    icon: GroupsOutlinedIcon,
    title: "Onboarding",
    description: "We confirm the plan, collect assets, and set up your project workspace and portal.",
  },
  {
    icon: RocketLaunchOutlinedIcon,
    title: "Project Build",
    description: "Design and development move forward with regular updates and milestone reviews.",
  },
  {
    icon: FactCheckOutlinedIcon,
    title: "Review",
    description: "We review the work together and complete the agreed revisions before release.",
  },
  {
    icon: CheckCircleOutlineIcon,
    title: "Launch",
    description: "Your project goes live with final checks, handoff, documentation, and training.",
  },
  {
    icon: SupportAgentOutlinedIcon,
    title: "Support",
    description: "Optional care plans provide ongoing updates, maintenance, and priority support.",
  },
];

export default function ClientJourney() {
  const theme = useTheme();

  return (
    <Box component="section" sx={{ py: { xs: 8, md: 11 }, bgcolor: alpha(theme.palette.background.paper, 0.42) }}>
      <Container maxWidth="xl" sx={publicContainerSx}>
        <Box sx={{ textAlign: "center", maxWidth: 720, mx: "auto", mb: { xs: 4.5, md: 6 } }}>
          <Typography sx={{ color: "primary.main", fontSize: "0.7rem", fontWeight: 900, letterSpacing: "0.14em", mb: 1.2 }}>
            THE PROCESS
          </Typography>
          <Typography component="h2" sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: { xs: "2rem", md: "2.7rem" }, fontWeight: 900, lineHeight: 1.08 }}>
            Your <Box component="span" sx={{ color: "primary.main" }}>Client Journey</Box>
          </Typography>
          <Typography sx={{ color: "text.secondary", mt: 1.5, lineHeight: 1.7 }}>
            What happens after you submit a project request, clearly mapped from inquiry to support.
          </Typography>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }, gap: 2 }}>
          {journeySteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <m.div key={step.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.35, delay: index * 0.04 }} style={{ height: "100%" }}>
                <Paper elevation={0} sx={{ position: "relative", height: "100%", p: 2.5, border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`, bgcolor: alpha(theme.palette.background.paper, 0.78), transition: "transform 180ms ease, border-color 180ms ease", "&:hover": { transform: "translateY(-3px)", borderColor: alpha(theme.palette.primary.main, 0.42) } }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.4, mb: 1.5 }}>
                    <Box sx={{ width: 40, height: 40, display: "grid", placeItems: "center", borderRadius: 1, color: "primary.main", bgcolor: alpha(theme.palette.primary.main, 0.11), flexShrink: 0 }}>
                      <Icon sx={{ fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography sx={{ color: "primary.main", fontSize: "0.58rem", fontWeight: 900, letterSpacing: "0.1em" }}>STEP {index + 1}</Typography>
                      <Typography component="h3" sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: "0.9rem", fontWeight: 850 }}>{step.title}</Typography>
                    </Box>
                  </Box>
                  <Typography sx={{ color: "text.secondary", fontSize: "0.78rem", lineHeight: 1.7 }}>{step.description}</Typography>
                  {index < journeySteps.length - 1 && (
                    <Box aria-hidden="true" sx={{ display: { xs: "none", lg: "block" }, position: "absolute", top: "50%", right: -10, width: 18, height: 1, bgcolor: alpha(theme.palette.primary.main, 0.32), zIndex: 2 }} />
                  )}
                </Paper>
              </m.div>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
}
