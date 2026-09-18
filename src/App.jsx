import { useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  Grid,
  OrbitControls,
  TransformControls,
} from "@react-three/drei";

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
} from "lucide-react";

import "./App.css";


/* =========================================================
   FURNITURE MODEL
========================================================= */

function FurnitureObject({
  object,
  selected,
  mode,
  onSelect,
  onChange,
  setTransforming,
}) {
  const groupRef = useRef(null);

  const handleObjectChange = () => {
    if (!groupRef.current) return;

    onChange(object.id, {
      position: [
        groupRef.current.position.x,
        groupRef.current.position.y,
        groupRef.current.position.z,
      ],

      rotation: [
        groupRef.current.rotation.x,
        groupRef.current.rotation.y,
        groupRef.current.rotation.z,
      ],

      scale: [
        groupRef.current.scale.x,
        groupRef.current.scale.y,
        groupRef.current.scale.z,
      ],
    });
  };


  let geometry = null;


  /* =======================================================
     SOFA
  ======================================================= */

  if (object.type === "sofa") {
    geometry = (
      <>
        <mesh castShadow>
          <boxGeometry args={[3, 0.7, 1]} />
          <meshStandardMaterial color={object.color} />
        </mesh>

        <mesh
          position={[0, 0.7, -0.35]}
          castShadow
        >
          <boxGeometry args={[3, 1, 0.3]} />
          <meshStandardMaterial color={object.color} />
        </mesh>

        <mesh
          position={[-1.35, 0.35, 0]}
          castShadow
        >
          <boxGeometry args={[0.3, 0.7, 1]} />
          <meshStandardMaterial color={object.color} />
        </mesh>

        <mesh
          position={[1.35, 0.35, 0]}
          castShadow
        >
          <boxGeometry args={[0.3, 0.7, 1]} />
          <meshStandardMaterial color={object.color} />
        </mesh>
      </>
    );
  }


  /* =======================================================
     TABLE
  ======================================================= */

  else if (object.type === "table") {
    geometry = (
      <>
        <mesh castShadow>
          <boxGeometry args={[2, 0.25, 1]} />
          <meshStandardMaterial color={object.color} />
        </mesh>

        {[
          [-0.8, -0.7, -0.35],
          [0.8, -0.7, -0.35],
          [-0.8, -0.7, 0.35],
          [0.8, -0.7, 0.35],
        ].map((position, index) => (
          <mesh
            key={index}
            position={position}
            castShadow
          >
            <boxGeometry args={[0.15, 1.4, 0.15]} />
            <meshStandardMaterial color={object.color} />
          </mesh>
        ))}
      </>
    );
  }


  /* =======================================================
     PLANT
  ======================================================= */

  else if (object.type === "plant") {
    geometry = (
      <>
        <mesh
          position={[0, -0.6, 0]}
          castShadow
        >
          <cylinderGeometry
            args={[0.45, 0.6, 0.7, 32]}
          />

          <meshStandardMaterial
            color="#704f35"
          />
        </mesh>

        <mesh
          position={[0, 0.3, 0]}
          castShadow
        >
          <sphereGeometry
            args={[0.9, 24, 24]}
          />

          <meshStandardMaterial
            color="#47724c"
          />
        </mesh>
      </>
    );
  }


  /* =======================================================
     BED
  ======================================================= */

  else if (object.type === "bed") {
    geometry = (
      <>
        <mesh
          position={[0, 0.35, 0]}
          castShadow
        >
          <boxGeometry
            args={[3, 0.4, 4]}
          />

          <meshStandardMaterial
            color={object.color}
          />
        </mesh>

        <mesh
          position={[0, 0.9, -1.75]}
          castShadow
        >
          <boxGeometry
            args={[3, 1.2, 0.25]}
          />

          <meshStandardMaterial
            color={object.color}
          />
        </mesh>

        <mesh
          position={[0, 0.62, 1]}
          castShadow
        >
          <boxGeometry
            args={[2.7, 0.25, 1]}
          />

          <meshStandardMaterial
            color="#eee8dc"
          />
        </mesh>
      </>
    );
  }


  /* =======================================================
     CHAIR
  ======================================================= */

  else if (object.type === "chair") {
    geometry = (
      <>
        <mesh
          position={[0, 0.5, 0]}
          castShadow
        >
          <boxGeometry
            args={[1.2, 0.25, 1.2]}
          />

          <meshStandardMaterial
            color={object.color}
          />
        </mesh>

        <mesh
          position={[0, 1.1, -0.45]}
          castShadow
        >
          <boxGeometry
            args={[1.2, 1.2, 0.2]}
          />

          <meshStandardMaterial
            color={object.color}
          />
        </mesh>

        {[
          [-0.45, 0, -0.45],
          [0.45, 0, -0.45],
          [-0.45, 0, 0.45],
          [0.45, 0, 0.45],
        ].map((position, index) => (
          <mesh
            key={index}
            position={position}
            castShadow
          >
            <boxGeometry
              args={[0.1, 1, 0.1]}
            />

            <meshStandardMaterial
              color={object.color}
            />
          </mesh>
        ))}
      </>
    );
  }


  /* =======================================================
     LAMP
  ======================================================= */

  else if (object.type === "lamp") {
    geometry = (
      <>
        <mesh
          position={[0, 0.8, 0]}
          castShadow
        >
          <cylinderGeometry
            args={[0.06, 0.06, 1.6, 16]}
          />

          <meshStandardMaterial
            color="#444"
          />
        </mesh>

        <mesh
          position={[0, 1.7, 0]}
          castShadow
        >
          <coneGeometry
            args={[0.45, 0.6, 32]}
          />

          <meshStandardMaterial
            color="#ddd0ad"
          />
        </mesh>
      </>
    );
  }


  return (
    <group>

      {/* Actual furniture object */}

      <group
        ref={groupRef}

        position={object.position}

        rotation={object.rotation}

        scale={object.scale}

        onClick={(event) => {
          event.stopPropagation();
          onSelect(object.id);
        }}
      >

        {geometry}

        {selected && (
          <mesh>

            <boxGeometry
              args={[3.5, 2.5, 4.5]}
            />

            <meshBasicMaterial
              color="#e6ff4f"
              wireframe
              transparent
              opacity={0.25}
            />

          </mesh>
        )}

      </group>


      {/* Transform controller */}

      {selected && groupRef.current && (

        <TransformControls
          object={groupRef.current}

          mode={mode}

          onMouseDown={() =>
            setTransforming(true)
          }

          onMouseUp={() =>
            setTransforming(false)
          }

          onObjectChange={
            handleObjectChange
          }

          size={0.9}
        />

      )}

    </group>
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
  setTransforming,
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

          setTransforming={
            setTransforming
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

  const [
    selectedId,
    setSelectedId,
  ] = useState("sofa01");


  const [
    transformMode,
    setTransformMode,
  ] = useState("translate");


  const [
    transforming,
    setTransforming,
  ] = useState(false);


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
        1,
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
        0.9,
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
        1,
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
        [0, 1, 0],

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

          <button
            className="secondary-button"
          >
            <Upload size={17} />

            Upload Room
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

              setTransforming={
                setTransforming
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
              makeDefault

              enabled={
                !transforming
              }

              enableDamping

              dampingFactor={0.08}

              minDistance={5}

              maxDistance={18}

              target={[
                0,
                1.5,
                0,
              ]}
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