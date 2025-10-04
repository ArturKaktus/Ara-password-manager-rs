import MenuStripComponent from "./components/MenuStrip/MenuStrip";
import SplitterComponent from "./components/Splitter/Splitter";

import "./App.css";

function App() {
  // Отключение браузерного контекстного меню
  // document.addEventListener('contextmenu', (e) => {
  //   e.preventDefault();
  //   return false;
  // });
  return (
    <div className="container">
      <MenuStripComponent />
      <SplitterComponent />
    </div>
  );
}

export default App;
