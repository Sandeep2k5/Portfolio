import styles from "./App.module.css";
import { About } from "./components/About/About";
import { Contact } from "./components/Contact/Contact";
import { Hero } from "./components/Hero/Hero";
import { Navbar } from "./components/Navbar/Navbar";
import { Projects } from "./components/Projects/Projects";
import { Exp } from "./components/Experience/Exp";
import { Pub } from "./components/Publications/Pub"; // if this also exists

function App() {
  return (
    <div className={styles.App}>
      <Navbar />
      <Hero />
      <About />
      <Exp />
      <Projects />
      <Pub/>
      <Contact/>
    </div>
  );
}

export default App;
