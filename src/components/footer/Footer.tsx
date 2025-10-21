import React from "react";
import { Box, Container, Typography, Link, Stack, IconButton } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "#1a1a1a",
        color: "#fff",
        py: 3,
        mt: "auto",
      }}
    >
      <Container maxWidth="lg">
        {/* Footer Links */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
        >
          <Typography variant="body2">
            © {new Date().getFullYear()} MyCompany. All rights reserved.
          </Typography>

          {/* Navigation Links */}
          <Stack direction="row" spacing={2}>
            <Link href="/about" color="inherit" underline="hover">
              About
            </Link>
            <Link href="/contact" color="inherit" underline="hover">
              Contact
            </Link>
            <Link href="/privacy" color="inherit" underline="hover">
              Privacy Policy
            </Link>
          </Stack>

          {/* Social Icons */}
          <Stack direction="row" spacing={1}>
            <IconButton
              aria-label="Facebook"
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: "#fff" }}
            >
              <FacebookIcon />
            </IconButton>
            <IconButton
              aria-label="LinkedIn"
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: "#fff" }}
            >
              <LinkedInIcon />
            </IconButton>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
