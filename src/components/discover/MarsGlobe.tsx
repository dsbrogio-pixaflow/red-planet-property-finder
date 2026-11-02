import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Html, Lightformer, OrbitControls } from "@react-three/drei";
import { Mesh, Quaternion, SRGBColorSpace, TextureLoader, Vector3, type Texture } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MARS_REGIONS } from "@/data/marsRegions";
import { marsPosition } from "@/utils/marsCoordinates";
import textureAsset from "@/assets/mars-viking.asset.json";
import { GlobeStatus } from "./GlobeStatus";

type Palette = { surface: string; marker: string; selected: string; light: string; fill: string };
type Props = { selectedId: string; onSelect: (id: string) => void };

class GraphicsBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  override render() { return this.state.failed ? <GlobeStatus failed /> : this.props.children; }
}

function Scene({ selectedId, onSelect, palette, texture, action, onReady, onView }: Props & {
  palette: Palette; texture: Texture | null; action: { kind: string; serial: number };
  onReady: () => void; onView: (distance: number, moving: boolean) => void;
}) {
  const planet = useRef<Mesh>(null);
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera, invalidate, size } = useThree();
  const motion = useRef<{ from: Quaternion; to: Quaternion; elapsed: number; distance: number } | null>(null);
  const ready = useRef(false);
  const distance = Math.max(5.5, 4 / Math.max(size.width / size.height, 0.65));
  const [facing, setFacing] = useState<Set<string>>(() => new Set([selectedId]));
  const prevDir = useRef(new Vector3(0, 0, 1));

  useEffect(() => {
    const region = MARS_REGIONS.find(r => r.id === selectedId);
    if (!region) return;
    controls.current?.target.set(0, 0, 0);
    const from = new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), camera.position.clone().normalize());
    const to = new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), new Vector3(...marsPosition(region.latitude, region.longitude)));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    motion.current = { from, to, elapsed: reduced ? 1.5 : 0, distance };
    invalidate();
  }, [selectedId, camera, distance, invalidate]);

  useEffect(() => {
    if (!action.serial) return;
    motion.current = null;
    if (action.kind === "reset") {
      const region = MARS_REGIONS.find(r => r.id === selectedId);
      if (region) camera.position.set(...marsPosition(region.latitude, region.longitude, distance));
      controls.current?.target.set(0, 0, 0);
    } else {
      const target = controls.current?.target ?? new Vector3();
      const offset = camera.position.clone().sub(target);
      const next = Math.min(10, Math.max(3.6, offset.length() * (action.kind === "in" ? 0.85 : 1 / 0.85)));
      camera.position.copy(target).add(offset.normalize().multiplyScalar(next));
    }
    controls.current?.update();
    invalidate();
    // Selection is handled separately; controls act only when their serial changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action, camera, invalidate]);

  useFrame((_, delta) => {
    const m = motion.current;
    if (m) {
      m.elapsed += Math.min(delta, 0.25);
      const t = Math.min(1, m.elapsed / 1.5);
      const ease = t * t * (3 - 2 * t);
      camera.position.copy(new Vector3(0, 0, 1).applyQuaternion(m.from.clone().slerp(m.to, ease)).multiplyScalar(m.distance));
      camera.lookAt(0, 0, 0);
      controls.current?.update();
      if (t < 1) invalidate(); else motion.current = null;
    }
    onView(camera.position.length(), Boolean(motion.current));
    const dir = camera.position.clone().normalize();
    if (dir.distanceToSquared(prevDir.current) > 2e-4) {
      prevDir.current.copy(dir);
      setFacing(new Set(MARS_REGIONS.filter(r => new Vector3(...marsPosition(r.latitude, r.longitude)).dot(dir) > 0.2).map(r => r.id)));
    }
    if (!ready.current) { ready.current = true; onReady(); }
  });

  return <>
    <ambientLight intensity={0.8} color={palette.fill} />
    <directionalLight position={[5, 4, 5]} intensity={2} color={palette.light} />
    <Environment resolution={64}>
      <Lightformer intensity={0.5} color={palette.light} position={[0, 5, 0]} scale={[10, 10, 1]} />
      <Lightformer intensity={0.3} color={palette.fill} position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[10, 5, 1]} />
    </Environment>
    <mesh ref={planet}>
      <sphereGeometry args={[1.6, 64, 48]} />
      <meshStandardMaterial map={texture} color={texture ? palette.light : palette.surface} roughness={0.98} metalness={0} />
    </mesh>
    {MARS_REGIONS.map(region => {
      const selected = selectedId === region.id;
      // Keep every label mounted and hide back-side ones: drei's Html owns a separate
      // React root per label, and unmounting it mid-render logs "synchronously unmount a root".
      const visible = selected || facing.has(region.id);
      return <group key={region.id} position={marsPosition(region.latitude, region.longitude, 1.64)} visible={visible}>
        <mesh><sphereGeometry args={[selected ? 0.026 : 0.016, 12, 8]} /><meshBasicMaterial color={selected ? palette.selected : palette.marker} /></mesh>
        <Html center zIndexRange={[20, 0]} style={visible ? undefined : { display: "none" }}>
          <Button variant="ghost" size="icon" onClick={() => onSelect(region.id)} aria-label={`Selecionar ${region.name} no mapa`} title={region.name} aria-pressed={selected}
            className="group relative size-9 rounded-full bg-transparent hover:bg-accent/60">
            <span className={`size-2 rounded-full border ${selected ? "border-warning bg-warning ring-4 ring-warning/20" : "border-foreground bg-background"}`} />
            {selected && <span className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded border border-warning/50 bg-background/90 px-3 py-1.5 text-xs text-warning">{region.name}</span>}
          </Button>
        </Html>
      </group>;
    })}
    <OrbitControls ref={controls} enableDamping dampingFactor={0.12} minDistance={3.6} maxDistance={10} enablePan panSpeed={0.5} rotateSpeed={0.6} zoomSpeed={0.65}
      onStart={() => { motion.current = null; }} onChange={() => invalidate()} />
  </>;
}

export default function MarsGlobe(props: Props) {
  const wrapper = useRef<HTMLDivElement>(null);
  const [palette, setPalette] = useState<Palette | null>(null);
  const [texture, setTexture] = useState<Texture | null>(null);
  const [textureState, setTextureState] = useState("loading");
  const [ready, setReady] = useState(false);
  const [action, setAction] = useState({ kind: "reset", serial: 0 });

  useEffect(() => {
    const css = getComputedStyle(document.documentElement);
    setPalette(Object.fromEntries(["surface", "marker", "selected", "light", "fill"].map(key => [key, css.getPropertyValue(`--globe-${key}`).trim()])) as Palette);
    let active = true;
    let loaded: Texture | undefined;
    new TextureLoader().load(textureAsset.url, value => {
      loaded = value;
      if (!active) { value.dispose(); return; }
      value.colorSpace = SRGBColorSpace;
      setTexture(value); setTextureState("loaded");
    }, undefined, () => { if (active) setTextureState("failed"); });
    return () => { active = false; loaded?.dispose(); };
  }, []);

  return <GraphicsBoundary>
    <div ref={wrapper} className="relative h-[480px] w-full touch-none overflow-hidden bg-background sm:h-[580px]" data-scene-ready={ready && textureState !== "loading" ? "true" : undefined} data-selected-region={props.selectedId} data-texture-state={textureState}>
      {palette && <Canvas frameloop="demand" dpr={[1, 1.5]} camera={{ position: [0, 0, 5.8], fov: 40 }} gl={{ antialias: true, alpha: true }} fallback={<GlobeStatus failed />}>
        <Scene {...props} palette={palette} texture={texture} action={action} onReady={() => setReady(true)} onView={(d, moving) => { if (wrapper.current) { wrapper.current.dataset["cameraDistance"] = d.toFixed(3); wrapper.current.dataset["moving"] = String(moving); } }} />
      </Canvas>}
      {!ready && <div className="absolute inset-0"><GlobeStatus /></div>}
      <div className="absolute bottom-5 right-4 flex gap-2" aria-label="Controles do globo">
        {[{ kind: "in", label: "Aproximar", Icon: Plus }, { kind: "out", label: "Afastar", Icon: Minus }, { kind: "reset", label: "Centralizar região", Icon: RotateCcw }].map(({ kind, label, Icon }) => <Button key={kind} variant="glass" size="icon" title={label} aria-label={label} onClick={() => setAction(a => ({ kind, serial: a.serial + 1 }))}><Icon aria-hidden /></Button>)}
      </div>
      <p className="pointer-events-none absolute left-4 top-4 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">Marte · 18 coordenadas</p>
      {textureState === "failed" && <p role="status" className="absolute bottom-4 left-4 max-w-[65%] text-xs text-warning">Textura indisponível. A esfera simplificada não representa detalhes científicos da superfície.</p>}
    </div>
  </GraphicsBoundary>;
}