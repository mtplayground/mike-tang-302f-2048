import { createBoard } from "./components/Board";
import "./styles.css";

const sampleTiles = [
  { id: "tile-2", value: 2, row: 0, column: 0 },
  { id: "tile-4", value: 4, row: 0, column: 1 },
  { id: "tile-8", value: 8, row: 1, column: 1 },
  { id: "tile-16", value: 16, row: 1, column: 2 },
  { id: "tile-32", value: 32, row: 2, column: 0 },
  { id: "tile-64", value: 64, row: 2, column: 3 },
  { id: "tile-128", value: 128, row: 3, column: 2 }
];

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("App root element was not found.");
}

const page = document.createElement("section");
page.className = "game-shell";

const heading = document.createElement("h1");
heading.className = "game-title";
heading.textContent = "2048";

page.append(heading, createBoard(sampleTiles));
app.append(page);
