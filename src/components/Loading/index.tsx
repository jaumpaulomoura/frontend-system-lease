import { Box, CircularProgress } from "@mui/material";

export function Loading() {
  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      zIndex={9000}
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      bgcolor="rgba(0, 0, 0, 0.5)"
    >
      <CircularProgress color="primary" />
    </Box>
  );
}
