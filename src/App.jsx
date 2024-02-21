import Button from "@mui/material/Button";
import ModeSelect from "./components/ModeSelect";

function App() {
  return (
    <>
      <ModeSelect />
      <hr />
      <div>Duy Truong</div>
      <Button variant="text">Hello World</Button>
      <Button variant="contained">Hello World</Button>
      <Button variant="outlined">Hello World</Button>
    </>
  );
}

export default App;
