import { Suspense, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Grid,
  OrbitControls,
  TransformControls,
  useGLTF,
} from "@react-three/drei";

import * as THREE from "three";

import {
  Upload,
  Sparkles,
  Save,
  Sofa as SofaIcon,
  Bed as BedIcon,
  Armchair,
  Lamp,
  TreePine,
  Table2,
  Trash2,
  Rotate3D,
  Maximize2,
  Image as ImageIcon,
  X as XIcon,
} from "lucide-react";

import "./App.css";
import { uploadRoomImageToS3 } from "./api/roomUpload";


/* =========================================================
   FURNITURE MODEL
========================================================= */

const MODEL_PATHS = {
  sofa: "/models/sofa.glb",
  chair: "/models/chair.glb",
  bed: "/models/bed.glb",
  table: "/models/table.glb",
};

/*
  Target maximum dimensions for the imported GLB models.
  Bed, chair and table are intentionally larger than before.
*/
const MODEL_TARGET_MAX_SIZE = {
  sofa: 3.4,
  chair: 2.5,
  bed: 4.4,
  table: 1.6,
};

const MODEL_ROTATION = {
  sofa: [0, Math.PI, 0],
  chair: [0, 0, 0],
  bed: [0, 0, 0],
  table: [0, 0, 0],
};

function GLBModel({ type }) {
  const { scene } = useGLTF(MODEL_PATHS[type]);
  const model = useMemo(() => scene.clone(true), [scene]);
  const modelRef = useRef(null);

  useLayoutEffect(() => {
    const root = modelRef.current;
    if (!root) return;

    root.scale.set(1, 1, 1);
    root.position.set(0, 0, 0);
    root.rotation.set(...(MODEL_ROTATION[type] || [0, 0, 0]));
    root.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(root);
    const size = new THREE.Vector3();
    box.getSize(size);

    const largestDimension = Math.max(
      size.x,
      size.y,
      size.z
    );

    const target = MODEL_TARGET_MAX_SIZE[type] || 2;

    if (largestDimension > 0) {
      const scale = target / largestDimension;
      root.scale.setScalar(scale);
    }

    root.updateMatrixWorld(true);

    const finalBox = new THREE.Box3().setFromObject(root);
    const center = new THREE.Vector3();
    finalBox.getCenter(center);

    /* Center the furniture on X/Z and put its feet on Y=0. */
    root.position.x -= center.x;
    root.position.z -= center.z;
    root.position.y -= finalBox.min.y;

    root.updateMatrixWorld(true);
  }, [model, type]);

  return (
    <group ref={modelRef}>
      <primitive object={model} />
    </group>
  );
}

function ProceduralPlant() {
  return (
    <>
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.45, 0.6, 0.7, 32]} />
        <meshStandardMaterial color="#704f35" />
      </mesh>

      <mesh position={[0, 1.15, 0]} castShadow>
        <sphereGeometry args={[0.9, 24, 24]} />
        <meshStandardMaterial color="#47724c" />
      </mesh>
    </>
  );
}

function ProceduralLamp() {
  return (
    <>
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 1.6, 16]} />
        <meshStandardMaterial color="#444" />
      </mesh>

      <mesh position={[0, 1.7, 0]} castShadow>
        <coneGeometry args={[0.45, 0.6, 32]} />
        <meshStandardMaterial color="#ddd0ad" />
      </mesh>
    </>
  );
}

function FurnitureGeometry({ object }) {
  if (MODEL_PATHS[object.type]) {
    return <GLBModel type={object.type} />;
  }

  if (object.type === "plant") {
    return <ProceduralPlant />;
  }

  if (object.type === "lamp") {
    return <ProceduralLamp />;
  }

  return null;
}

function FurnitureObject({
  object,
  selected,
  mode,
  onSelect,
  onChange,
  orbitControlsRef,
}) {
  const [target, setTarget] = useState(null);

  const handleObjectChange = () => {
    if (!target) return;

    onChange(object.id, {
      position: [
        target.position.x,
        target.position.y,
        target.position.z,
      ],
      rotation: [
        target.rotation.x,
        target.rotation.y,
        target.rotation.z,
      ],
      scale: [
        target.scale.x,
        target.scale.y,
        target.scale.z,
      ],
    });
  };

  const furnitureGroup = (
    <group
      ref={setTarget}
      position={object.position}
      rotation={object.rotation}
      scale={object.scale}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(object.id);
      }}
    >
      <Suspense fallback={null}>
        <FurnitureGeometry object={object} />
      </Suspense>

      {selected && (
        <mesh raycast={() => null}>
          <boxGeometry args={[3.6, 2.8, 4.6]} />
          <meshBasicMaterial
            color="#e6ff4f"
            wireframe
            transparent
            opacity={0.22}
            depthTest={false}
          />
        </mesh>
      )}
    </group>
  );

  return (
    <>
      {selected && target && (
        <TransformControls
          mode={mode}
          size={0.9}
          space={mode === "scale" ? "local" : "world"}
          object={target}
          onDraggingChanged={(event) => {
            if (orbitControlsRef.current) {
              orbitControlsRef.current.enabled = !event.value;
            }

            if (!event.value) {
              handleObjectChange();
            }
          }}
        />
      )}
      {furnitureGroup}
    </>
  );
}


/* =========================================================
   ROOM
========================================================= */

function Room({
  furniture,
  selectedId,
  setSelectedId,
  updateFurniture,
  transformMode,
  orbitControlsRef,
}) {
  return (
    <group>

      {/* FLOOR */}

      <mesh
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}

        position={[
          0,
          0,
          0,
        ]}

        receiveShadow

        onClick={() =>
          setSelectedId(null)
        }
      >

        <planeGeometry
          args={[10, 8]}
        />

        <meshStandardMaterial
          color="#8a7968"
        />

      </mesh>


      {/* BACK WALL */}

      <mesh
        position={[
          0,
          2.5,
          -4,
        ]}
      >

        <boxGeometry
          args={[10, 5, 0.15]}
        />

        <meshStandardMaterial
          color="#d8d2c8"
        />

      </mesh>


      {/* LEFT WALL */}

      <mesh
        position={[
          -5,
          2.5,
          0,
        ]}

        rotation={[
          0,
          Math.PI / 2,
          0,
        ]}
      >

        <boxGeometry
          args={[8, 5, 0.15]}
        />

        <meshStandardMaterial
          color="#e2ddd5"
        />

      </mesh>


      {/* RIGHT WALL */}

      <mesh
        position={[
          5,
          2.5,
          0,
        ]}

        rotation={[
          0,
          Math.PI / 2,
          0,
        ]}
      >

        <boxGeometry
          args={[8, 5, 0.15]}
        />

        <meshStandardMaterial
          color="#e2ddd5"
        />

      </mesh>


      {/* CEILING */}

      <mesh
        position={[
          0,
          5,
          0,
        ]}

        rotation={[
          Math.PI / 2,
          0,
          0,
        ]}
      >

        <planeGeometry
          args={[10, 8]}
        />

        <meshStandardMaterial
          color="#f1eee8"
        />

      </mesh>


      {/* FURNITURE */}

      {furniture.map((object) => (

        <FurnitureObject
          key={object.id}

          object={object}

          selected={
            selectedId === object.id
          }

          mode={transformMode}

          onSelect={
            setSelectedId
          }

          onChange={
            updateFurniture
          }

          orbitControlsRef={
            orbitControlsRef
          }
        />

      ))}

    </group>
  );
}


/* =========================================================
   MAIN APP
========================================================= */

function App() {

  const orbitControlsRef = useRef(null);
  const fileInputRef = useRef(null);

  const [roomImage, setRoomImage] = useState(null);
  const [showImageOverlay, setShowImageOverlay] = useState(true);
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [uploadError, setUploadError] = useState("");

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Please select a valid image file (JPG, PNG, or WebP).");
      e.target.value = "";
      return;
    }

    // Show the image immediately in the existing Room Reference panel
    const url = URL.createObjectURL(file);

    setRoomImage({
      url,
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
      s3Key: null,
    });

    setShowImageOverlay(true);
    setUploadStatus("uploading");
    setUploadError("");

    try {
      // Upload the same image to Amazon S3
      const result = await uploadRoomImageToS3(file);

      setRoomImage((previous) => ({
        ...previous,
        s3Key: result.key,
      }));

      setUploadStatus("uploaded");

      console.log("Room image uploaded to S3:", result.key);
    } catch (error) {
      console.error("Room image upload failed:", error);

      setUploadStatus("error");
      setUploadError(error.message);

      alert(`Room image upload failed: ${error.message}`);
    }

    e.target.value = "";
  };

  const [
    selectedId,
    setSelectedId,
  ] = useState("sofa01");


  const [
    transformMode,
    setTransformMode,
  ] = useState("translate");


  const [
    furniture,
    setFurniture,
  ] = useState([

    {
      id: "sofa01",

      type: "sofa",

      name: "Modern Sofa",

      position: [
        0,
        0,
        -2.5,
      ],

      rotation: [
        0,
        0,
        0,
      ],

      scale: [
        1,
        1,
        1,
      ],

      color: "#b99b7a",

      material: "fabric",
    },


    {
      id: "table01",

      type: "table",

      name: "Coffee Table",

      position: [
        0,
        0,
        0,
      ],

      rotation: [
        0,
        0,
        0,
      ],

      scale: [
        1,
        1,
        1,
      ],

      color: "#654b38",

      material: "wood",
    },


    {
      id: "plant01",

      type: "plant",

      name: "Indoor Plant",

      position: [
        3.5,
        0,
        -2,
      ],

      rotation: [
        0,
        0,
        0,
      ],

      scale: [
        1,
        1,
        1,
      ],

      color: "#47724c",

      material: "natural",
    },

  ]);


  /* =======================================================
     UPDATE OBJECT
  ======================================================= */

  const updateFurniture = (
    id,
    changes
  ) => {

    setFurniture(
      (previous) =>

        previous.map(
          (item) =>

            item.id === id
              ? {
                  ...item,
                  ...changes,
                }
              : item
        )
    );

  };


  /* =======================================================
     ADD OBJECT
  ======================================================= */

  const addFurniture = (
    type
  ) => {

    const names = {

      sofa:
        "Modern Sofa",

      chair:
        "Modern Chair",

      bed:
        "Modern Bed",

      table:
        "Coffee Table",

      lamp:
        "Floor Lamp",

      plant:
        "Indoor Plant",

    };


    const newObject = {

      id:
        `${type}-${Date.now()}`,

      type,

      name:
        names[type],

      position:
        [0, 0, 0],

      rotation:
        [0, 0, 0],

      scale:
        [1, 1, 1],

      color:
        type === "plant"
          ? "#47724c"
          : "#b99b7a",

      material:
        type === "plant"
          ? "natural"
          : "fabric",

    };


    setFurniture(
      (previous) => [
        ...previous,
        newObject,
      ]
    );


    setSelectedId(
      newObject.id
    );

  };


  /* =======================================================
     DELETE
  ======================================================= */

  const deleteSelected = () => {

    if (!selectedId) return;


    setFurniture(
      (previous) =>

        previous.filter(
          (item) =>
            item.id !== selectedId
        )
    );


    setSelectedId(null);

  };


  const selectedObject =
    furniture.find(
      (item) =>
        item.id === selectedId
    );


  return (

    <div className="app">


      {/* TOP BAR */}

      <header className="topbar">

        <div className="brand">

          <div className="brand-mark">
            ◆
          </div>

          <div>

            <h1>
              ROOMREVIVE{" "}
              <span>AI</span>
            </h1>

            <p>
              Design it in 3D.
              See it in reality.
            </p>

          </div>

        </div>


        <div className="top-actions">

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp,image/jpg"
            style={{ display: "none" }}
          />

          <button
            className="secondary-button"
            onClick={handleUploadClick}
          >
            <Upload size={17} />

            {roomImage ? "Change Room" : "Upload Room"}
          </button>


          <button
            className="ai-button"
          >
            <Sparkles size={17} />

            AI Analyze
          </button>


          <button
            className="icon-button"
          >
            <Save size={18} />
          </button>

        </div>

      </header>


      {/* WORKSPACE */}

      <main className="workspace">


        {/* LEFT */}

        <aside className="left-panel">

          <div className="panel-title">

            <div>

              <h2>
                Furniture
              </h2>

              <p>
                Build your room
              </p>

            </div>

          </div>


          <input
            className="search-box"
            placeholder="Search furniture..."
          />


          <div className="category-title">
            FURNITURE
          </div>


          <div className="furniture-grid">


            <button
              className="furniture-card"

              onClick={() =>
                addFurniture(
                  "sofa"
                )
              }
            >

              <SofaIcon
                size={27}
              />

              <span>
                Sofa
              </span>

            </button>


            <button
              className="furniture-card"

              onClick={() =>
                addFurniture(
                  "chair"
                )
              }
            >

              <Armchair
                size={27}
              />

              <span>
                Chair
              </span>

            </button>


            <button
              className="furniture-card"

              onClick={() =>
                addFurniture(
                  "bed"
                )
              }
            >

              <BedIcon
                size={27}
              />

              <span>
                Bed
              </span>

            </button>


            <button
              className="furniture-card"

              onClick={() =>
                addFurniture(
                  "table"
                )
              }
            >

              <Table2
                size={27}
              />

              <span>
                Table
              </span>

            </button>


            <button
              className="furniture-card"

              onClick={() =>
                addFurniture(
                  "lamp"
                )
              }
            >

              <Lamp
                size={27}
              />

              <span>
                Lamp
              </span>

            </button>


            <button
              className="furniture-card"

              onClick={() =>
                addFurniture(
                  "plant"
                )
              }
            >

              <TreePine
                size={27}
              />

              <span>
                Plant
              </span>

            </button>

          </div>


          <div className="category-title">
            AI TOOLS
          </div>


          <button className="ai-tool">

            <Sparkles
              size={17}
            />

            Suggest Layout

          </button>


          <button className="ai-tool">

            <Rotate3D
              size={17}
            />

            Optimize Space

          </button>

        </aside>


        {/* 3D VIEWPORT */}

        <section className="viewport">

          <div className="viewport-label">

            <span className="live-dot"></span>

            3D EDITOR

          </div>

          {roomImage && (
            <div className="uploaded-room-preview">
              <div className="preview-header">
                <div className="preview-title">
                  <ImageIcon size={14} />
                  <span>Room Reference</span>
                </div>
                <div className="preview-actions">
                  <button
                    className="preview-toggle-btn"
                    title={showImageOverlay ? "Minimize Preview" : "Expand Preview"}
                    onClick={() => setShowImageOverlay(!showImageOverlay)}
                  >
                    <Maximize2 size={13} />
                  </button>
                  <button
                    className="preview-close-btn"
                    title="Remove Image"
                    onClick={() => {
                      if (roomImage.url) URL.revokeObjectURL(roomImage.url);
                      setRoomImage(null);
                    }}
                  >
                    <XIcon size={13} />
                  </button>
                </div>
              </div>
              {showImageOverlay && (
                <div className="preview-body">
                  <img src={roomImage.url} alt="Uploaded Room View" />
                  <div className="preview-info">
                    <span className="file-name" title={roomImage.name}>{roomImage.name}</span>
                    <span className="file-size">{roomImage.size}</span>
                    {uploadStatus === "uploading" && (
                      <span className="file-size">
                        Uploading to AWS...
                      </span>
                    )}
                    {uploadStatus === "uploaded" && (
                      <span className="file-size">
                        ✓ Synced to AWS
                      </span>
                    )}
                    {uploadStatus === "error" && (
                      <span className="file-size">
                        Upload failed
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}


          <Canvas
            shadows

            camera={{
              position: [
                8,
                6,
                9,
              ],

              fov: 45,
            }}

            onPointerMissed={() =>
              setSelectedId(null)
            }
          >

            <color
              attach="background"
              args={[
                "#15171b",
              ]}
            />


            <ambientLight
              intensity={1.5}
            />


            <directionalLight
              position={[
                5,
                8,
                5,
              ]}

              intensity={3}

              castShadow
            />


            <pointLight
              position={[
                -3,
                4,
                2,
              ]}

              intensity={2}
            />


            <Room
              furniture={
                furniture
              }

              selectedId={
                selectedId
              }

              setSelectedId={
                setSelectedId
              }

              updateFurniture={
                updateFurniture
              }

              transformMode={
                transformMode
              }

              orbitControlsRef={
                orbitControlsRef
              }
            />


            <Grid
              position={[
                0,
                0.01,
                0,
              ]}

              args={[
                10,
                8,
              ]}

              cellSize={0.5}

              cellThickness={0.5}

              sectionSize={2}

              sectionThickness={1}

              fadeDistance={30}

              fadeStrength={1}
            />


            <OrbitControls
              ref={orbitControlsRef}
              makeDefault
              enableDamping
              dampingFactor={0.08}
              minDistance={5}
              maxDistance={18}
              target={[
                0,
                1.5,
                0,
              ]}
              enableRotate
              enableZoom
              enablePan
            />

          </Canvas>


          <div className="viewport-controls">

            <button>
              Top View
            </button>

            <button className="active">
              Perspective
            </button>

            <button>
              Walkthrough
            </button>

          </div>

        </section>


        {/* RIGHT */}

        <aside className="right-panel">


          <div className="properties-header">

            <div>

              <h2>
                Properties
              </h2>

              <p>
                {selectedObject
                  ? "Selected object"
                  : "Nothing selected"}
              </p>

            </div>


            <Trash2
              size={18}

              className="delete-icon"

              onClick={
                deleteSelected
              }
            />

          </div>


          {selectedObject ? (

            <>


              <div className="selected-object">

                <div className="object-icon">

                  <SofaIcon
                    size={24}
                  />

                </div>


                <div>

                  <strong>
                    {
                      selectedObject.name
                    }
                  </strong>

                  <span>
                    Furniture /{" "}
                    {
                      selectedObject.type
                    }
                  </span>

                </div>

              </div>


              {/* TRANSFORM */}

              <div className="property-section">

                <h3>
                  Transform
                </h3>


                <div className="transform-buttons">


                  <button
                    className={
                      transformMode ===
                      "translate"
                        ? "transform active"
                        : "transform"
                    }

                    onClick={() =>
                      setTransformMode(
                        "translate"
                      )
                    }
                  >
                    Move
                  </button>


                  <button
                    className={
                      transformMode ===
                      "rotate"
                        ? "transform active"
                        : "transform"
                    }

                    onClick={() =>
                      setTransformMode(
                        "rotate"
                      )
                    }
                  >
                    Rotate
                  </button>


                  <button
                    className={
                      transformMode ===
                      "scale"
                        ? "transform active"
                        : "transform"
                    }

                    onClick={() =>
                      setTransformMode(
                        "scale"
                      )
                    }
                  >
                    Scale
                  </button>


                </div>

              </div>


              {/* POSITION */}

              <div className="property-section">

                <h3>
                  Position
                </h3>


                <div className="input-row">


                  <label>
                    X

                    <input
                      value={
                        selectedObject
                          .position[0]
                          .toFixed(2)
                      }

                      readOnly
                    />

                  </label>


                  <label>
                    Y

                    <input
                      value={
                        selectedObject
                          .position[1]
                          .toFixed(2)
                      }

                      readOnly
                    />

                  </label>


                  <label>
                    Z

                    <input
                      value={
                        selectedObject
                          .position[2]
                          .toFixed(2)
                      }

                      readOnly
                    />

                  </label>


                </div>

              </div>


              {/* ROTATION */}

              <div className="property-section">

                <h3>
                  Rotation
                </h3>


                <div className="input-row">


                  <label>
                    X

                    <input
                      value={
                        (
                          selectedObject
                            .rotation[0] *
                          180 /
                          Math.PI
                        ).toFixed(1) +
                        "°"
                      }

                      readOnly
                    />

                  </label>


                  <label>
                    Y

                    <input
                      value={
                        (
                          selectedObject
                            .rotation[1] *
                          180 /
                          Math.PI
                        ).toFixed(1) +
                        "°"
                      }

                      readOnly
                    />

                  </label>


                  <label>
                    Z

                    <input
                      value={
                        (
                          selectedObject
                            .rotation[2] *
                          180 /
                          Math.PI
                        ).toFixed(1) +
                        "°"
                      }

                      readOnly
                    />

                  </label>


                </div>

              </div>


              {/* SCALE */}

              <div className="property-section">

                <h3>
                  Scale
                </h3>


                <div className="input-row">


                  <label>
                    X

                    <input
                      value={
                        selectedObject
                          .scale[0]
                          .toFixed(2)
                      }

                      readOnly
                    />

                  </label>


                  <label>
                    Y

                    <input
                      value={
                        selectedObject
                          .scale[1]
                          .toFixed(2)
                      }

                      readOnly
                    />

                  </label>


                  <label>
                    Z

                    <input
                      value={
                        selectedObject
                          .scale[2]
                          .toFixed(2)
                      }

                      readOnly
                    />

                  </label>


                </div>

              </div>


              {/* MATERIAL */}

              <div className="property-section">

                <h3>
                  Material
                </h3>


                <div className="material-options">

                  <button className="material active">
                    Fabric
                  </button>

                  <button className="material">
                    Leather
                  </button>

                  <button className="material">
                    Velvet
                  </button>

                </div>

              </div>


              {/* COLOR */}

              <div className="property-section">

                <h3>
                  Color
                </h3>


                <div className="color-options">

                  <button className="color beige" />

                  <button className="color brown" />

                  <button className="color grey" />

                  <button className="color white" />

                  <button className="color black" />

                </div>

              </div>


              <button
                className="resize-button"

                onClick={() =>
                  setTransformMode(
                    "scale"
                  )
                }
              >

                <Maximize2
                  size={16}
                />

                Resize Object

              </button>


            </>

          ) : (

            <div className="empty-properties">

              Click a furniture item
              in the 3D room to
              select it.

            </div>

          )}

        </aside>

      </main>


      {/* BOTTOM BAR */}

      <footer className="bottom-bar">

        <div>

          <span className="status-dot"></span>

          Room synced

        </div>


        <div className="bottom-actions">

          <button>
            Undo
          </button>

          <button>
            Redo
          </button>

          <button>
            Screenshot
          </button>

        </div>

      </footer>

    </div>
  );
}


export default App;