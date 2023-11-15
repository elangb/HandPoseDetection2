import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import Webcam from "react-webcam";
import "./App.css";
import { drawHand } from "./utilities";

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [gesture, setGesture] = useState(null);

  useEffect(() => {
    const runHandpose = async () => {
      const net = await handpose.load();
      console.log("Handpose model loaded.");

      // Loop and detect hands
      setInterval(() => {
        detect(net);
      }, 100);
    };

    runHandpose();
  }, []);

  const detect = async (net) => {
    // Check data is available
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas height and width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Make Detections
      const hands = await net.estimateHands(video);
      console.log(hands);

      // Draw mesh
      const ctx = canvasRef.current.getContext("2d");
      drawHand(hands, ctx);

      // Update hand gesture
      if (hands.length > 0) {
        const fingersUp = [false, false, false, false, false];
        const landmarks = hands[0].landmarks;

        // Check if index, middle, and ring fingers are up
        if (
          landmarks[8][1] < landmarks[6][1] &&
          landmarks[12][1] < landmarks[10][1] &&
          landmarks[16][1] < landmarks[14][1]
        ) {
          fingersUp[1] = true;
          fingersUp[2] = true;
          fingersUp[3] = true;
        }

        // Check if thumb and pinky fingers are down
        if (landmarks[4][0] > landmarks[5][0] && landmarks[20][0] > landmarks[19][0]) {
          fingersUp[0] = true;
          fingersUp[4] = true;
        }

        // Check for "Yes" gesture
        if (fingersUp[1] && fingersUp[2] && fingersUp[3] && fingersUp[4]) {
          setGesture("Yes");
        } else {
          setGesture("No");
        }
      } else {
        setGesture(null);
      }
    }
  };

  return (
    <div className="App">
      <h1>{gesture !== null ? `Gesture: ${gesture}` : "No Hand Detected"}</h1>
      <header className="App-header">
        <h1>
          Hello World
        </h1>
        <Webcam
          ref={webcamRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 9,
            width: 640,
            height: 480,
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 9,
            width: 640,
            height: 480,
          }}
        />
      </header>
    </div>
  );
}

export default App;
