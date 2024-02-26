import Box from "@mui/material/Box";
import ModeSelect from "~/components/ModeSelect";
import AppsIcon from "@mui/icons-material/Apps";

const AppBar = () => {
  return (
    <Box
      sx={{
        width: "100%",
        height: (theme) => theme.trello.appBarHeight,
        display: "flex",
        alighItems: "center",
        justifyItems: "space-between",
      }}
    >
      <Box>
        <AppsIcon />
        Trello
      </Box>
      <Box>
        <ModeSelect />
      </Box>
    </Box>
  );
};

export default AppBar;
