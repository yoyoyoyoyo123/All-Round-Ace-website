import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { gsap } from 'gsap'
import logoImgSrc from '../../assets/logo.png'
import './Loader.css'

const DOOR_Z = -9

export default function Loader({ onComplete }) {
  const loaderRef = useRef(null)
  const mountRef  = useRef(null)
  const fadeRef   = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    let rafId
    const toDispose = []

    // ── Renderer ─────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
    mount.appendChild(renderer.domElement)

    // ── Scene ─────────────────────────────────────────────────────────
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x060606)
    scene.fog = new THREE.Fog(0x060606, 11, 24)

    // ── Camera ────────────────────────────────────────────────────────
    // Starts looking DOWN at the floor logo, then tilts up toward the door
    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      100,
    )
    camera.position.set(0, 3.4, 3.8)
    const camTarget = new THREE.Vector3(0, 0, 0)

    // ── Ambient (barely enough to hint at the room) ───────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.03))

    // ── Floor ─────────────────────────────────────────────────────────
    const floorGeo = new THREE.PlaneGeometry(16, 30)
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0d0d0d,
      roughness: 0.45,
      metalness: 0.55,
    })
    const floor = new THREE.Mesh(floorGeo, floorMat)
    floor.rotation.x = -Math.PI / 2
    floor.position.z = -6
    floor.receiveShadow = true
    scene.add(floor)
    toDispose.push(floorGeo, floorMat)

    // ── Corridor Walls ────────────────────────────────────────────────
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x070707, roughness: 1 })
    toDispose.push(wallMat)

    function addPlane(w, h, px, py, pz, ry = 0) {
      const g = new THREE.PlaneGeometry(w, h)
      const m = new THREE.Mesh(g, wallMat)
      m.position.set(px, py, pz)
      m.rotation.y = ry
      scene.add(m)
      toDispose.push(g)
    }
    addPlane(30, 6, -6.5, 3, -5,  Math.PI / 2)   // left wall
    addPlane(30, 6,  6.5, 3, -5, -Math.PI / 2)   // right wall
    addPlane(16, 6,  0, 3,  5, Math.PI)           // wall behind camera
    addPlane(16, 6,  0, 9, -5, 0)                 // ceiling

    // ── Far wall — zero-gap calculation ──────────────────────────────
    // Door opening: 2.0 wide (x: -1.0 to +1.0), 3.2 tall (y: 0 to 3.2)
    // Frame posts outer edge: ±1.1  |  corridor half-width: 6.5
    const FW = 6.5 - 1.1       // 5.4 — each side panel width
    const FX = (6.5 + 1.1) / 2 // 3.8 — each side panel center X
    addPlane(FW, 6, -FX, 3, DOOR_Z, 0)           // far-left sealed
    addPlane(FW, 6,  FX, 3, DOOR_Z, 0)           // far-right sealed
    addPlane(2.2, 2.8, 0, 4.6, DOOR_Z, 0)        // top lintel (y: 3.2 → 6)

    // ── White void behind the door (MeshBasicMaterial: ignores all lights & fog) ──
    const voidGeo = new THREE.PlaneGeometry(50, 50)
    const voidMat = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false })
    const voidPlane = new THREE.Mesh(voidGeo, voidMat)
    voidPlane.position.set(0, 0, DOOR_Z - 0.4)
    scene.add(voidPlane)
    toDispose.push(voidGeo, voidMat)

    // ── Door Frame (gold trim) ────────────────────────────────────────
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x7a5c0f,
      roughness: 0.12,
      metalness: 0.95,
    })
    toDispose.push(frameMat)

    function addBox(w, h, d, px, py, pz) {
      const g = new THREE.BoxGeometry(w, h, d)
      const m = new THREE.Mesh(g, frameMat)
      m.position.set(px, py, pz)
      scene.add(m)
      toDispose.push(g)
    }
    // Posts outer edge ±1.1 → center ±1.05, width 0.1; top bar bottom at y=3.2
    addBox(2.2,  0.1,  0.12,  0,     3.25, DOOR_Z + 0.02)   // top bar
    addBox(0.1,  3.25, 0.12, -1.05,  1.625, DOOR_Z + 0.02)  // left post
    addBox(0.1,  3.25, 0.12,  1.05,  1.625, DOOR_Z + 0.02)  // right post

    // ── Door panel — exactly fills the 2.0 × 3.2 opening ────────────
    // Pivot sits at the inner-left edge (x = −1.0)
    const doorPivot = new THREE.Group()
    doorPivot.position.set(-1.0, 0, DOOR_Z)
    scene.add(doorPivot)

    const doorMesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 3.2, 0.09),
      new THREE.MeshStandardMaterial({ color: 0x110902, roughness: 0.65, metalness: 0.25 }),
    )
    doorMesh.position.set(1.0, 1.6, 0)   // center offset from pivot = half-width, half-height
    doorPivot.add(doorMesh)
    toDispose.push(doorMesh.geometry, doorMesh.material)

    const handleGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.24, 8)
    const handleMat = new THREE.MeshStandardMaterial({ color: 0xd4a017, roughness: 0.1, metalness: 1 })
    const handle = new THREE.Mesh(handleGeo, handleMat)
    handle.rotation.z = Math.PI / 2
    handle.position.set(0.8, 1.6, 0.06)
    doorPivot.add(handle)
    toDispose.push(handleGeo, handleMat)

    // ── 5 Red Spotlights (spread along the logo width) ────────────────
    const spots = []
    const spotXPositions = [-2.5, -1.25, 0, 1.25, 2.5]

    spotXPositions.forEach((x) => {
      const s = new THREE.SpotLight(0xdd1100, 0)
      s.position.set(x, 7.5, 3.5)
      s.target.position.set(x, 0, 0.3)
      s.angle    = Math.PI / 15
      s.penumbra = 0.5
      s.decay    = 1.2
      s.distance = 18
      s.castShadow = false
      scene.add(s, s.target)
      spots.push(s)
      toDispose.push(s)
    })

    // ── Logo Floor Tile (logo.png → force white) ─────────────────────
    const offscreen = document.createElement('canvas')
    offscreen.width  = 2048
    offscreen.height = 512
    const ctx = offscreen.getContext('2d')

    const imgLogo = new Image()

    imgLogo.onload = () => {
      ctx.clearRect(0, 0, 2048, 512)
      // Draw original (with alpha)
      ctx.drawImage(imgLogo, 0, 0, 2048, 512)
      // Replace all coloured pixels with white while preserving alpha
      ctx.globalCompositeOperation = 'source-in'
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, 2048, 512)
      ctx.globalCompositeOperation = 'source-over'

      const tex = new THREE.CanvasTexture(offscreen)
      tex.colorSpace = THREE.SRGBColorSpace

      const logoGeo = new THREE.PlaneGeometry(6.5, 1.6)
      const logoMat = new THREE.MeshStandardMaterial({
        map: tex,
        transparent: true,
        roughness: 0.25,
        metalness: 0.65,
        alphaTest: 0.02,
      })
      const logoPlane = new THREE.Mesh(logoGeo, logoMat)
      logoPlane.rotation.x = -Math.PI / 2
      logoPlane.position.set(0, 0.018, 0.3)
      logoPlane.receiveShadow = true
      scene.add(logoPlane)
      toDispose.push(logoGeo, logoMat, tex)
    }

    imgLogo.onerror = () => console.warn('[Loader] logo.png failed to load')
    imgLogo.src = logoImgSrc

    // ── Animation Timeline ────────────────────────────────────────────
    const tl = gsap.timeline({ delay: 0.4 })

    // Phase 1 — Spotlights sweep left → right (5 lights × 0.45 s apart)
    spotXPositions.forEach((_, i) => {
      tl.to(spots[i], { intensity: 32, duration: 0.7, ease: 'power2.out' }, 0.3 + i * 0.45)
    })

    // Phase 2 — Hold; logo fully lit
    tl.to({}, { duration: 1.8 })

    // Phase 3 — Camera stands up and tilts toward the door
    tl.addLabel('liftUp')
    tl.to(camera.position, { y: 1.65, z: 1.8, duration: 2.4, ease: 'power2.inOut' }, 'liftUp')
    tl.to(camTarget,       { y: 1.6,  z: DOOR_Z, duration: 2.4, ease: 'power2.inOut' }, 'liftUp')
    // Spotlights fade out as camera rises
    spots.forEach((s) => {
      tl.to(s, { intensity: 0, duration: 1.6, ease: 'power2.in' }, 'liftUp+=0.35')
    })

    // Phase 4 — Brief pause before door opens
    tl.to({}, { duration: 0.6 })

    // Phase 5 — Door swings open; white void behind is immediately revealed
    tl.to(doorPivot.rotation, { y: -Math.PI * 0.84, duration: 2.3, ease: 'power3.inOut' })

    // Phase 6 — Walk into the white light
    tl.to(camera.position, { z: DOOR_Z - 2.5, duration: 3.0, ease: 'power3.in' })

    // Phase 7 — Dissolve into white, then hand off
    tl.to(fadeRef.current, { opacity: 1, duration: 0.7, ease: 'linear' }, '-=0.6')
    tl.add(() => {
      onComplete?.()
      if (loaderRef.current) loaderRef.current.style.display = 'none'
    })

    // ── Render Loop ───────────────────────────────────────────────────
    const animate = () => {
      rafId = requestAnimationFrame(animate)
      camera.lookAt(camTarget)
      renderer.render(scene, camera)
    }
    animate()

    // ── Resize ────────────────────────────────────────────────────────
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    // ── Cleanup ───────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId)
      tl.kill()
      window.removeEventListener('resize', onResize)
      toDispose.forEach((d) => d?.dispose?.())
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [onComplete])

  return (
    <div ref={loaderRef} className="loader">
      <div ref={mountRef} className="loader__canvas" />
      <div ref={fadeRef}  className="loader__fade" />
    </div>
  )
}
