import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import Draggable from "react-draggable";
import styles from "../styles/Home.module.css";

const CELL_SIZE = 50;

function ledConnectedToSource(connections) {
  return (
    connections["resistor-source"] === "A-A" &&
    connections["led-resistor"] === "A-B"
  );
}

function sizeByOrientation(size, orientation) {
  if (orientation === "horizontal") {
    return {
      width: size * CELL_SIZE,
      height: CELL_SIZE,
    };
  } else {
    return {
      width: CELL_SIZE,
      height: size * CELL_SIZE,
    };
  }
}

function pointsAreClose(point1, point2, a, b) {
  const threshold = 1;
  var dx = Math.abs(point2.x - point1.x);
  var dy = Math.abs(point2.y - point1.y);
  var diagonalDistance = Math.sqrt(dx * dx + dy * dy);

  if (dx <= threshold && dy <= threshold && diagonalDistance === threshold) {
    return [a, b];
  }
}

function objectsAreConnected(element1, element2) {
  const firstStart = element1;
  const secondEnd = {
    x:
      element2.x +
      (element2.orientation === "horizontal" ? element2.size - 1 : 0),
    y:
      element2.y +
      (element2.orientation === "vertical" ? element2.size - 1 : 0),
  };
  const firstEnd = {
    x:
      element1.x +
      (element1.orientation === "horizontal" ? element1.size - 1 : 0),
    y:
      element1.y +
      (element1.orientation === "vertical" ? element1.size - 1 : 0),
  };
  const secondStart = element2;

  return (
    pointsAreClose(firstStart, secondEnd, "A", "B") ||
    pointsAreClose(firstEnd, secondStart, "B", "A") ||
    pointsAreClose(firstStart, secondStart, "A", "A") ||
    pointsAreClose(firstEnd, secondEnd, "B", "B")
  );
}

const EL1_SIZE = 3;
const EL2_SIZE = 4;
const LED_SIZE = 2;

export default function Home() {
  const [state, setState] = useState({});
  const [ledColor, setLedColor] = useState("unset");

  const doSomethingWithState = (state) => {
    console.log("doSomethingWithState", state);

    const items = Object.entries(state);
    const connections = {};
    for (const [id1, item1] of items) {
      for (const [id2, item2] of items) {
        if (id1 === id2) {
          continue;
        }
        const maybeCollides = objectsAreConnected(item1, item2);
        if (maybeCollides) {
          const collision = [id1, id2].sort().join("-");
          if (!connections[collision]) {
            connections[collision] = maybeCollides.join("-");
          }
        }
      }
    }

    console.log("connections", JSON.stringify(connections, null, 2));

    if (ledConnectedToSource(connections)) {
      setLedColor("0 0 50px 20px red");
    } else {
      setLedColor("unset");
    }
  };

  const onStop = (e, data) => {
    // console.log("onStop", e, data);
    const id = data.node.id;
    const x = data.x / CELL_SIZE;
    const y = data.y / CELL_SIZE;

    setState((state) => ({
      ...state,
      [id]: {
        orientation: data.node.dataset.orientation,
        size: +data.node.dataset.size,
        x,
        y,
      },
    }));
  };

  const onStart = (e, data) => {
    setLedColor("unset");
  };

  useEffect(() => {
    doSomethingWithState(state);
  }, [state]);

  useEffect(() => {
    const element = document.querySelector("#grid");
    const viewportWidth = window.innerWidth;
    const roundedViewportWidth = Math.floor(viewportWidth / 100) * 100;
    element.style.width = `${roundedViewportWidth}px`;
    const viewportHeight = window.innerHeight;
    const roundedViewportHeight = Math.floor(viewportHeight / 100) * 100;
    element.style.height = `${roundedViewportHeight}px`;
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Circuit Simulator</title>
        <meta name="description" content="Circuit Simulator" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Circuit Simulator</h1>
        <div id="grid" className={styles.grid}>
          <Draggable
            handle=".handle"
            bounds="parent"
            defaultPosition={{ x: 0, y: 0 }}
            position={null}
            grid={[CELL_SIZE, CELL_SIZE]}
            scale={1}
            onStop={onStop}
            onStart={onStart}
          >
            <div
              className={`${styles.drag} handle ${styles.source}`}
              id="source"
              data-size={EL1_SIZE}
              data-orientation="vertical"
              style={{
                ...sizeByOrientation(EL1_SIZE, "vertical"),
                borderTop: "3px solid green",
                borderBottom: "3px solid blue",
              }}
            ></div>
          </Draggable>
          <Draggable
            handle=".handle"
            bounds="parent"
            defaultPosition={{ x: 0, y: 0 }}
            position={null}
            grid={[CELL_SIZE, CELL_SIZE]}
            scale={1}
            onStop={onStop}
            onStart={onStart}
          >
            <div
              className={`${styles.drag} handle ${styles.resistor}`}
              id="resistor"
              data-size={EL2_SIZE}
              data-orientation="horizontal"
              style={{
                ...sizeByOrientation(EL2_SIZE, "horizontal"),
                backgroundColor: "#faf191",
              }}
            ></div>
          </Draggable>
          <Draggable
            handle=".handle"
            bounds="parent"
            defaultPosition={{ x: 0, y: 0 }}
            position={null}
            grid={[CELL_SIZE, CELL_SIZE]}
            scale={1}
            onStop={onStop}
            onStart={onStart}
          >
            <div
              className={`${styles.drag} handle ${styles.led}`}
              id="led"
              data-size={LED_SIZE}
              data-orientation="horizontal"
              style={{
                ...sizeByOrientation(LED_SIZE, "horizontal"),
                boxShadow: ledColor,
                border:
                  ledColor !== "0 0 50px 20px red" ? "none" : "6px solid red",
                borderLeft: "3px solid green",
                borderRight: "3px solid blue",
              }}
            ></div>
          </Draggable>
        </div>
      </main>
    </div>
  );
}
