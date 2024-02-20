import Button from "@mui/material/Button";
import { useColorScheme } from "@mui/material/styles";

function App() {
  const { mode, setMode } = useColorScheme();

  return (
    <>
      <Button
        onClick={() => {
          setMode(mode === "light" ? "dark" : "light");
        }}
      >
        {mode === "light" ? "Turn dark" : "Turn light"}
      </Button>
      <hr />
      <div>Duy Truong</div>
      <Button variant="text">Hello World</Button>
      <Button variant="contained">Hello World</Button>
      <Button variant="outlined">Hello World</Button>
    </>
  );
}

export default App;
