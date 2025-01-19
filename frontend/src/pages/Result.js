import React, { useRef, useEffect } from "react";

const Result = () => {
const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const startVideoStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener("loadedmetadata", () => {
            if (canvasRef.current) {
              canvasRef.current.width = videoRef.current.videoWidth;
              canvasRef.current.height = videoRef.current.videoHeight;
              startDetection();
            }
          });
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    };

    startVideoStream();

    return () => {
      // Cleanup video stream on unmount
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  const startDetection = () => {
    const ctx = canvasRef.current.getContext("2d");

    setInterval(async () => {
      if (videoRef.current && canvasRef.current) {
        ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

        const imageBlob = await new Promise((resolve) => {
          canvasRef.current.toBlob(resolve, "image/jpeg");
        });

        const formData = new FormData();
        formData.append("file", imageBlob, "frame.jpg");

        try {
          const response = await fetch("http://127.0.0.1:8000/predict", {
            method: "POST",
            body: formData,
          });

          const data = await response.json();
          displayBoundingBoxes(data);
        } catch (error) {
          console.error("Error sending frame to backend:", error);
        }
      }
    }, 1000); // Send 1 frame per second
  };

  const displayBoundingBoxes = (data) => {
    // Remove existing boxes
    const boxes = document.querySelectorAll(".box");
    boxes.forEach((box) => box.remove());

    if (data.predictions && Array.isArray(data.predictions)) {
      data.predictions.forEach((prediction) => {
        const { probability, boundingBox, tagName } = prediction;

        if (probability > 0.5) {
          const { left, top, width, height } = boundingBox;

          const box = document.createElement("div");
          box.className = "box";
          box.style.position = "absolute";
          box.style.border = "2px solid red";
          box.style.color = "red";
          box.style.fontSize = "12px";
          box.style.fontWeight = "bold";
          box.style.pointerEvents = "none";
          box.style.left = `${left * canvasRef.current.width}px`;
          box.style.top = `${top * canvasRef.current.height}px`;
          box.style.width = `${width * canvasRef.current.width}px`;
          box.style.height = `${height * canvasRef.current.height}px`;

          box.innerHTML = `${tagName} (${(probability * 100).toFixed(1)}%)`;

          document.body.appendChild(box);
        }
      });
    }
  };

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline style={{ position: "absolute", top: 0, left: 0 }}></video>
      <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0 }}></canvas>
    </div>
  );
};

export default Result;