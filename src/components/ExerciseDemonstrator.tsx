import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";

// ── Types ─────────────────────────────────────────────────────────────────────
export type Difficulty = "beginner" | "intermediate" | "advanced";
export type AnimationId =
  | "squat" | "pushup" | "lunge" | "press"
  | "curl"  | "row"    | "deadlift";

export interface ExerciseDemonstratorProps {
  exerciseName: string;
  animationId:  AnimationId;
  difficulty:   Difficulty;
  autoPlay?:    boolean;
}

// ── Brand colours ─────────────────────────────────────────────────────────────
const BRAND = {
  primary:   0x6366f1,   // indigo-500
  accent:    0xa78bfa,   // violet-400
  light:     0xc4b5fd,   // violet-300  – joints
  skin:      0x818cf8,   // indigo-400  – secondary limbs
};

const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  beginner:     "bg-emerald-100 text-emerald-700",
  intermediate: "bg-amber-100   text-amber-700",
  advanced:     "bg-rose-100    text-rose-700",
};

// ── Easing ────────────────────────────────────────────────────────────────────
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ── Mannequin builder ─────────────────────────────────────────────────────────
interface Mannequin {
  root:     THREE.Group;
  // torso chain
  hips:     THREE.Group;
  torso:    THREE.Group;
  head:     THREE.Group;
  neck:     THREE.Group;
  // arms  (groups at shoulder pivot)
  lShoulder: THREE.Group;
  rShoulder: THREE.Group;
  lElbow:    THREE.Group;
  rElbow:    THREE.Group;
  // legs  (groups at hip pivot)
  lHip:      THREE.Group;
  rHip:      THREE.Group;
  lKnee:     THREE.Group;
  rKnee:     THREE.Group;
}

function createMannequin(scene: THREE.Scene): Mannequin {
  const matPrimary = new THREE.MeshStandardMaterial({
    color: BRAND.primary, roughness: 0.3, metalness: 0.05,
  });
  const matAccent = new THREE.MeshStandardMaterial({
    color: BRAND.accent, roughness: 0.3, metalness: 0.05,
  });
  const matJoint = new THREE.MeshStandardMaterial({
    color: BRAND.light, roughness: 0.25, metalness: 0.1,
  });

  function capsule(r: number, len: number, mat: THREE.Material) {
    const g = new THREE.CapsuleGeometry(r, len, 8, 16);
    return new THREE.Mesh(g, mat);
  }
  function sphere(r: number, mat: THREE.Material) {
    const g = new THREE.SphereGeometry(r, 16, 12);
    return new THREE.Mesh(g, mat);
  }

  // ── Root & spine chain ────────────────────────────────────────────────────
  const root = new THREE.Group();
  scene.add(root);

  const hips = new THREE.Group();
  root.add(hips);

  // Pelvis mesh
  const pelvisMesh = capsule(0.13, 0.05, matPrimary);
  pelvisMesh.rotation.z = Math.PI / 2;
  hips.add(pelvisMesh);

  const torso = new THREE.Group();
  torso.position.y = 0.28;
  hips.add(torso);

  // Torso capsule
  const torsoMesh = capsule(0.14, 0.34, matPrimary);
  torsoMesh.position.y = 0.17;
  torso.add(torsoMesh);

  const neck = new THREE.Group();
  neck.position.y = 0.44;
  torso.add(neck);
  const neckMesh = capsule(0.055, 0.08, matAccent);
  neckMesh.position.y = 0.04;
  neck.add(neckMesh);

  const head = new THREE.Group();
  head.position.y = 0.15;
  neck.add(head);
  const headMesh = sphere(0.13, matPrimary);
  head.add(headMesh);
  // Face dots
  const eyeL = sphere(0.022, matJoint); eyeL.position.set(-0.045, 0.025, 0.11); head.add(eyeL);
  const eyeR = sphere(0.022, matJoint); eyeR.position.set( 0.045, 0.025, 0.11); head.add(eyeR);

  // ── Shoulders / arms ──────────────────────────────────────────────────────
  // Joint spheres at shoulder
  const lShoulderJoint = sphere(0.07, matJoint);
  lShoulderJoint.position.set(-0.21, 0.36, 0);
  torso.add(lShoulderJoint);
  const rShoulderJoint = sphere(0.07, matJoint);
  rShoulderJoint.position.set( 0.21, 0.36, 0);
  torso.add(rShoulderJoint);

  // L upper arm
  const lShoulder = new THREE.Group();
  lShoulder.position.set(-0.21, 0.36, 0);
  torso.add(lShoulder);
  const lUAMesh = capsule(0.055, 0.22, matAccent);
  lUAMesh.position.y = -0.15;
  lShoulder.add(lUAMesh);

  // L elbow
  const lElbow = new THREE.Group();
  lElbow.position.y = -0.30;
  lShoulder.add(lElbow);
  const lElbowJoint = sphere(0.055, matJoint);
  lElbow.add(lElbowJoint);
  const lFAMesh = capsule(0.045, 0.20, matPrimary);
  lFAMesh.position.y = -0.13;
  lElbow.add(lFAMesh);

  // R upper arm
  const rShoulder = new THREE.Group();
  rShoulder.position.set( 0.21, 0.36, 0);
  torso.add(rShoulder);
  const rUAMesh = capsule(0.055, 0.22, matAccent);
  rUAMesh.position.y = -0.15;
  rShoulder.add(rUAMesh);

  // R elbow
  const rElbow = new THREE.Group();
  rElbow.position.y = -0.30;
  rShoulder.add(rElbow);
  const rElbowJoint = sphere(0.055, matJoint);
  rElbow.add(rElbowJoint);
  const rFAMesh = capsule(0.045, 0.20, matPrimary);
  rFAMesh.position.y = -0.13;
  rElbow.add(rFAMesh);

  // ── Hips / legs ───────────────────────────────────────────────────────────
  // L hip
  const lHip = new THREE.Group();
  lHip.position.set(-0.12, 0, 0);
  hips.add(lHip);
  const lHipJoint = sphere(0.075, matJoint);
  lHip.add(lHipJoint);
  const lThighMesh = capsule(0.075, 0.32, matPrimary);
  lThighMesh.position.y = -0.22;
  lHip.add(lThighMesh);

  // L knee
  const lKnee = new THREE.Group();
  lKnee.position.y = -0.44;
  lHip.add(lKnee);
  const lKneeJoint = sphere(0.065, matJoint);
  lKnee.add(lKneeJoint);
  const lShinMesh = capsule(0.06, 0.28, matAccent);
  lShinMesh.position.y = -0.18;
  lKnee.add(lShinMesh);
  // L foot
  const lFoot = new THREE.Mesh(
    new THREE.BoxGeometry(0.07, 0.04, 0.16),
    matPrimary,
  );
  lFoot.position.set(0, -0.36, 0.04);
  lKnee.add(lFoot);

  // R hip
  const rHip = new THREE.Group();
  rHip.position.set( 0.12, 0, 0);
  hips.add(rHip);
  const rHipJoint = sphere(0.075, matJoint);
  rHip.add(rHipJoint);
  const rThighMesh = capsule(0.075, 0.32, matPrimary);
  rThighMesh.position.y = -0.22;
  rHip.add(rThighMesh);

  // R knee
  const rKnee = new THREE.Group();
  rKnee.position.y = -0.44;
  rHip.add(rKnee);
  const rKneeJoint = sphere(0.065, matJoint);
  rKnee.add(rKneeJoint);
  const rShinMesh = capsule(0.06, 0.28, matAccent);
  rShinMesh.position.y = -0.18;
  rKnee.add(rShinMesh);
  // R foot
  const rFoot = new THREE.Mesh(
    new THREE.BoxGeometry(0.07, 0.04, 0.16),
    matPrimary,
  );
  rFoot.position.set(0, -0.36, 0.04);
  rKnee.add(rFoot);

  // Cast shadows on all meshes
  root.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });

  // Standing neutral height: hips sit at y=0.88 so feet touch y=0
  hips.position.y = 0.88;

  return { root, hips, torso, neck, head, lShoulder, rShoulder, lElbow, rElbow, lHip, rHip, lKnee, rKnee };
}

// ── Pose functions ────────────────────────────────────────────────────────────
function resetPose(m: Mannequin) {
  m.hips.position.set(0, 0.88, 0);
  m.hips.rotation.set(0, 0, 0);
  m.torso.rotation.set(0, 0, 0);
  m.lShoulder.rotation.set(0, 0, 0);
  m.rShoulder.rotation.set(0, 0, 0);
  m.lElbow.rotation.set(0, 0, 0);
  m.rElbow.rotation.set(0, 0, 0);
  m.lHip.rotation.set(0, 0, 0);
  m.rHip.rotation.set(0, 0, 0);
  m.lKnee.rotation.set(0, 0, 0);
  m.rKnee.rotation.set(0, 0, 0);
}

function applySquat(m: Mannequin, raw: number) {
  const t = easeInOutCubic(raw);
  const hipDrop = t * 0.42;           // hips drop 42cm at full squat

  // Hip height — subtract the drop
  m.hips.position.y = 0.88 - hipDrop;

  // Slight foot-width spread
  // Hip joint rotation (thigh rotates forward)
  m.lHip.rotation.x  =  t * 1.25;    // thigh swings forward
  m.rHip.rotation.x  =  t * 1.25;
  m.lHip.rotation.z  =  t * 0.18;    // knees track out
  m.rHip.rotation.z  = -t * 0.18;

  // Knee flexion
  m.lKnee.rotation.x = -t * 1.45;
  m.rKnee.rotation.x = -t * 1.45;

  // Torso leans slightly forward
  m.torso.rotation.x = t * 0.22;

  // Arms counter-balance forward
  m.lShoulder.rotation.x = -t * 0.55;
  m.rShoulder.rotation.x = -t * 0.55;
  m.lElbow.rotation.x    =  t * 0.35;
  m.rElbow.rotation.x    =  t * 0.35;
}

function applyCurl(m: Mannequin, raw: number) {
  const t = easeInOutCubic(raw);
  m.lElbow.rotation.x = -t * 2.1;
  m.rElbow.rotation.x = -t * 2.1;
  m.lShoulder.rotation.z =  t * 0.1;
  m.rShoulder.rotation.z = -t * 0.1;
}

function applyPress(m: Mannequin, raw: number) {
  const t = easeInOutCubic(raw);
  m.lShoulder.rotation.x = -t * 1.5;
  m.rShoulder.rotation.x = -t * 1.5;
  m.lShoulder.rotation.z =  t * 0.2;
  m.rShoulder.rotation.z = -t * 0.2;
  m.lElbow.rotation.x    = -t * 0.4;
  m.rElbow.rotation.x    = -t * 0.4;
}

function applyLunge(m: Mannequin, raw: number) {
  const t = easeInOutCubic(raw);
  const drop = t * 0.32;
  m.hips.position.y = 0.88 - drop;
  m.lHip.rotation.x  =  t * 1.15;
  m.lKnee.rotation.x = -t * 1.3;
  m.rHip.rotation.x  = -t * 0.65;
  m.rKnee.rotation.x = -t * 0.2;
  m.torso.rotation.x = t * 0.1;
}

function applyPushup(m: Mannequin, raw: number) {
  const t = easeInOutCubic(raw);
  // Plank: tilt whole body
  m.root.rotation.x      = Math.PI / 2 - 0.18;
  m.root.position.y      = -0.65 - t * 0.22;
  m.lHip.rotation.x      = -Math.PI / 2 + 0.18;
  m.rHip.rotation.x      = -Math.PI / 2 + 0.18;
  m.lKnee.rotation.x     =  0;
  m.rKnee.rotation.x     =  0;
  m.lShoulder.rotation.x =  t * 0.8;
  m.rShoulder.rotation.x =  t * 0.8;
  m.lElbow.rotation.x    = -t * 0.6;
  m.rElbow.rotation.x    = -t * 0.6;
}

function applyRow(m: Mannequin, raw: number) {
  const t = easeInOutCubic(raw);
  m.hips.rotation.x      = 0.6;
  m.torso.rotation.x     = -0.1;
  m.lShoulder.rotation.x =  t * 1.3;
  m.rShoulder.rotation.x =  t * 1.3;
  m.lElbow.rotation.x    = -t * 1.0;
  m.rElbow.rotation.x    = -t * 1.0;
}

function applyDeadlift(m: Mannequin, raw: number) {
  const t  = easeInOutCubic(raw);
  const up = t;                      // 0 = hinged, 1 = standing
  m.hips.rotation.x  = (1 - up) * 0.8;
  m.torso.rotation.x = -(1 - up) * 0.1;
  m.lHip.rotation.x  =  (1 - up) * 0.45;
  m.rHip.rotation.x  =  (1 - up) * 0.45;
  m.lKnee.rotation.x = -(1 - up) * 0.35;
  m.rKnee.rotation.x = -(1 - up) * 0.35;
  m.lShoulder.rotation.x = (1 - up) * 0.7;
  m.rShoulder.rotation.x = (1 - up) * 0.7;
}

const POSE_MAP: Record<AnimationId, (m: Mannequin, t: number) => void> = {
  squat:    applySquat,
  curl:     applyCurl,
  press:    applyPress,
  lunge:    applyLunge,
  pushup:   applyPushup,
  row:      applyRow,
  deadlift: applyDeadlift,
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function ExerciseDemonstrator({
  exerciseName,
  animationId,
  difficulty,
  autoPlay = true,
}: ExerciseDemonstratorProps) {
  const mountRef  = useRef<HTMLDivElement>(null);
  const sceneRef  = useRef<{
    renderer: THREE.WebGLRenderer;
    camera:   THREE.PerspectiveCamera;
    scene:    THREE.Scene;
    mannequin: Mannequin;
    animId:   string;
    clock:    THREE.Clock;
    rafId:    number;
    playing:  boolean;
    elapsed:  number;
  } | null>(null);

  const [playing, setPlaying]     = useState(autoPlay);
  const [progress, setProgress]   = useState(0);

  // ── Bootstrap Three.js ────────────────────────────────────────────────────
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const W = container.clientWidth  || 600;
    const H = container.clientHeight || 500;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
    renderer.toneMapping       = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.setClearColor(0xf5f5f0);
    container.appendChild(renderer.domElement);

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f0);
    scene.fog = new THREE.Fog(0xf5f5f0, 8, 20);

    // Camera
    const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 50);
    camera.position.set(0, 1.1, 3.8);
    camera.lookAt(0, 0.9, 0);

    // ── Lighting ──────────────────────────────────────────────────────────
    // Hemisphere (sky/ground)
    const hemi = new THREE.HemisphereLight(0xffffff, 0xe8e0d8, 0.6);
    scene.add(hemi);

    // Key light (top-right-front)
    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(2.5, 4.5, 2.5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far  = 12;
    key.shadow.camera.left = key.shadow.camera.bottom = -2;
    key.shadow.camera.right = key.shadow.camera.top   =  2;
    key.shadow.bias = -0.001;
    scene.add(key);

    // Fill light (left)
    const fill = new THREE.DirectionalLight(0xd0d8ff, 0.55);
    fill.position.set(-3, 2, 1);
    scene.add(fill);

    // Rim light (back)
    const rim = new THREE.DirectionalLight(0xfff0e8, 0.4);
    rim.position.set(0, 2, -3);
    scene.add(rim);

    // ── Ground ────────────────────────────────────────────────────────────
    // Studio floor
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xeeeae4, roughness: 0.85, metalness: 0,
    });
    const floor = new THREE.Mesh(new THREE.CircleGeometry(5, 64), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Contact shadow blob
    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext("2d")!;
    const grad = sCtx.createRadialGradient(128, 128, 10, 128, 128, 128);
    grad.addColorStop(0,   "rgba(80,70,140,0.38)");
    grad.addColorStop(0.5, "rgba(80,70,140,0.14)");
    grad.addColorStop(1,   "rgba(80,70,140,0)");
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 256, 256);
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowBlob = new THREE.Mesh(
      new THREE.PlaneGeometry(0.9, 0.55),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }),
    );
    shadowBlob.rotation.x = -Math.PI / 2;
    shadowBlob.position.y = 0.001;
    scene.add(shadowBlob);

    // ── Mannequin ─────────────────────────────────────────────────────────
    const mannequin = createMannequin(scene);

    // ── Clock & state ─────────────────────────────────────────────────────
    const clock = new THREE.Clock();
    sceneRef.current = {
      renderer, camera, scene, mannequin,
      animId: animationId,
      clock, rafId: 0,
      playing: autoPlay,
      elapsed: 0,
    };

    // ── Render loop ───────────────────────────────────────────────────────
    const LOOP_DURATION = 2.0; // seconds
    let cameraAngle = 0;

    function animate() {
      const ref = sceneRef.current!;
      ref.rafId = requestAnimationFrame(animate);

      const delta = clock.getDelta();

      if (ref.playing) {
        ref.elapsed = (ref.elapsed + delta) % LOOP_DURATION;
      }

      const raw = ref.elapsed / LOOP_DURATION;          // 0..1 in cycle
      // Ping-pong: 0→0.5 = down, 0.5→1 = up
      const phase = raw < 0.5 ? raw * 2 : (1 - raw) * 2; // 0→1→0

      resetPose(ref.mannequin);
      const poseFn = POSE_MAP[ref.animId as AnimationId];
      if (poseFn) poseFn(ref.mannequin, phase);

      // Slow camera orbit
      if (ref.playing) {
        cameraAngle += delta * 0.18;
        const camR = 3.8;
        camera.position.x = Math.sin(cameraAngle) * camR;
        camera.position.z = Math.cos(cameraAngle) * camR;
        camera.position.y = 1.1 + Math.sin(cameraAngle * 0.5) * 0.05;
        camera.lookAt(0, 0.9, 0);
      }

      setProgress(raw);
      renderer.render(scene, camera);
    }
    animate();

    // ── Resize observer ────────────────────────────────────────────────────
    const ro = new ResizeObserver(() => {
      if (!container || !sceneRef.current) return;
      const nW = container.clientWidth;
      const nH = container.clientHeight;
      sceneRef.current.renderer.setSize(nW, nH);
      sceneRef.current.camera.aspect = nW / nH;
      sceneRef.current.camera.updateProjectionMatrix();
    });
    ro.observe(container);

    return () => {
      ro.disconnect();
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.rafId);
        sceneRef.current.renderer.dispose();
        sceneRef.current.scene.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) {
            (obj as THREE.Mesh).geometry.dispose();
            const mat = (obj as THREE.Mesh).material;
            if (Array.isArray(mat)) mat.forEach(m => m.dispose());
            else mat.dispose();
          }
        });
        sceneRef.current = null;
      }
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Sync animationId changes ───────────────────────────────────────────────
  useEffect(() => {
    if (sceneRef.current) sceneRef.current.animId = animationId;
  }, [animationId]);

  // ── Play / pause ───────────────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    setPlaying((p) => {
      const next = !p;
      if (sceneRef.current) sceneRef.current.playing = next;
      return next;
    });
  }, []);

  // ── Progress ring ──────────────────────────────────────────────────────────
  const r  = 18;
  const circ = 2 * Math.PI * r;
  const dash = circ * progress;

  return (
    <div className="relative w-full h-full min-h-[480px] rounded-2xl overflow-hidden select-none bg-[#f5f5f0]">
      {/* Three.js mount */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Bottom-left: name + badge */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 pointer-events-none">
        <span className="text-[15px] font-semibold text-gray-800 drop-shadow-sm">
          {exerciseName}
        </span>
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full w-fit capitalize ${DIFFICULTY_COLOR[difficulty]}`}>
          {difficulty}
        </span>
      </div>

      {/* Bottom-right: progress ring + play/pause */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2">
        <button
          onClick={togglePlay}
          className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow flex items-center justify-center
                     hover:bg-white transition-colors border border-white/60 text-indigo-600"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <rect x="2" y="1" width="4" height="12" rx="1.5"/>
              <rect x="8" y="1" width="4" height="12" rx="1.5"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <path d="M3 1.5l9 5.5-9 5.5V1.5z"/>
            </svg>
          )}
        </button>

        <svg width="44" height="44" className="drop-shadow-sm">
          <circle cx="22" cy="22" r={r} fill="white" fillOpacity={0.75} />
          <circle
            cx="22" cy="22" r={r}
            fill="none" stroke="#e0e0e8" strokeWidth="3"
          />
          <circle
            cx="22" cy="22" r={r}
            fill="none" stroke="#6366f1" strokeWidth="3"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            transform="rotate(-90 22 22)"
            style={{ transition: "stroke-dasharray 0.05s linear" }}
          />
        </svg>
      </div>
    </div>
  );
}
