import { NextPage } from "next";
import { useEffect, useRef } from "react";
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FlyControls } from 'three/examples/jsm/controls/FlyControls'

type Planet = {
    name: string,
    distance: number,
    url: string,
    speed: number,
    radius: number
}
type Planets = {
    mesh: THREE.Mesh,
    speed: number,
    distance: number
}
const K = 5
const PLANET_BASE_URL = 'http://www.yanhuangxueyuan.com/3D/solarSystem//贴图/'
const PLANET_DATA: Planet[] = [
    {
        name: '太阳',
        radius: 5 * K,
        distance: 0,
        url: `https://assets.fedtop.com/picbed/sun_color.jpg`,
        speed: 0
    },
    {
        name: '水星',
        radius: 1.25 * K,
        distance: 10 * K,
        url: `https://assets.fedtop.com/picbed/mercury_color.jpg`,
        speed: 0.02
    },
    {
        name: '金星',
        radius: 1.5 * K,
        distance: 15 * K,
        url: 'https://assets.fedtop.com/picbed/venus_color.jpg',
        speed: 0.015
    },
    {
        name: '地球',
        radius: 1.6 * K,
        distance: 20 * K,
        url: 'https://assets.fedtop.com/picbed/earth_color.jpg',
        speed: 0.03
    },
    {
        name: '火星',
        radius: 1.25 * K,
        distance: 25 * K,
        url: 'https://assets.fedtop.com/picbed/mars_color.jpg',
        speed: 0.025
    },
    {
        name: '木星',
        radius: 2.5 * K,
        distance: 30 * K,
        url: 'https://assets.fedtop.com/picbed/jupiter_color.jpg',
        speed: 0.01
    },
    {
        name: '土星',
        radius: 1.75 * K,
        distance: 35 * K,
        url: 'https://assets.fedtop.com/picbed/saturn_color.jpg',
        speed: 0.015
    },
    {
        name: '天王星',
        radius: 1.75 * K,
        distance: 40 * K,
        url: 'https://assets.fedtop.com/picbed/uranus_color.jpg',
        speed: 0.01
    },
    {
        name: '海王星',
        radius: 2 * K,
        distance: 50 * K,
        url: 'https://assets.fedtop.com/picbed/neptune_color.jpg',
        speed: 0.008
    }
]

const Planet: NextPage = () => {
    let scene: THREE.Scene = new THREE.Scene()
    let camera: THREE.Camera
    let renderer: THREE.WebGLRenderer
    let starMesh: THREE.Points
    let planets: Planets[]

    const flag = useRef<boolean>(false)

    const init = () => {
        createStar()
        createOrbit()
        
        const pointLight = new THREE.PointLight(new THREE.Color(0xffffff), 2, 1, 0)
        // pointLight.visible = true
        pointLight.position.set(400, 200, 300) // 点光源在原点充当太阳
        scene.add(pointLight) // 点光源添加到场景中
        var ambient = new THREE.AmbientLight(0x444444);
        scene.add(ambient);

        const cubeEl = document.getElementById("planet")!
        const width = cubeEl?.clientWidth
        const height = cubeEl?.clientHeight
        const s = 310
        const k = width / height
        // 创建相机对象
        camera = new THREE.OrthographicCamera(
            -s * k, s * k, s, -s, 1, 1500
        )
        camera.position.set(651, 613, 525)
        camera.lookAt(scene.position) // 设置相机方向（指向的场景方向）

        renderer = new THREE.WebGLRenderer()
        renderer.setSize(width, height)
        renderer.setClearColor(0x101010, 1);

        if (!flag.current) {
            cubeEl?.appendChild(renderer.domElement)
        }
        flag.current = true
        renderScene()

        // 创建控件对象
        const orbitControls = new OrbitControls(camera, renderer.domElement)
        orbitControls.autoRotate = true
        orbitControls.autoRotateSpeed = 0.5
        orbitControls.enableDamping = true
        orbitControls.dampingFactor = 0.25
        orbitControls.enableZoom = true
        // 创建飞行控制器
        const flyControls = new FlyControls(camera, renderer.domElement)
        flyControls.movementSpeed = 10
        flyControls.domElement = renderer.domElement
        flyControls.rollSpeed = Math.PI / 24
        flyControls.autoForward = false
        flyControls.dragToLook = true
    }

    // 创建星辰
    const createStar = () => {
        const positions = []
        const colors = []
        // 星辰几何体
        const starGeom = new THREE.BufferGeometry()
        // 添加星辰的颜色与位置
        const n = 1200
        for (let i = 0; i < 3000; i++) {
            const particle = new THREE.Vector3(
                // (Math.random() - 0.5) * n,
                // (Math.random() - 0.5) * n,
                // (Math.random() - 0.5) * n
                Math.random() * 2 - 1,
                Math.random() * 2 - 1,
                Math.random() * 2 - 1
            )
            positions.push(particle.x, particle.y, particle.z)
            const color_k = Math.random() 
            const color = new THREE.Color(color_k, color_k, color_k * 0.6)
            colors.push(color.r, color.g, color.b)   
        }
        starGeom.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(positions, 3)
        )
        starGeom.setAttribute(
            'color',
            new THREE.Float32BufferAttribute(colors, 3)
        )
        // 星辰材质
        const starMeterial = new THREE.PointsMaterial({
            size: 0.1,
            blending: THREE.AdditiveBlending,
            fog: true,
            depthTest: false
        })
        // 星辰集合
        starMesh = new THREE.Points(starGeom, starMeterial)
        starMesh.scale.set(1000, 1000, 1000)
        scene.add(starMesh)
    }

    // 创建行星轨道
    const createOrbit = () => {
        planets.forEach((planet: any) => {
            // 圆环
            const trackGeometry = new THREE.RingGeometry(
                planet.distance,
                planet.distance + 0.2,
                30
            )
            const trackMaterial = new THREE.MeshBasicMaterial({
                color: 0x222222,
                side: THREE.DoubleSide,
                // opacity: 0.5,
                // transparent: true
            })
            const trackMesh = new THREE.Mesh(trackGeometry, trackMaterial)
            trackMesh.rotation.x = -0.5 * Math.PI
            trackMesh.position.set(0, 0, 0)
            scene.add(trackMesh)
        })
    }

    // 创建太阳系
    const createPlanets = () => {
        planets = PLANET_DATA.map((planet, index) => {
            // 创建行星
            const geometry = new THREE.SphereGeometry(planet.radius, 20, 20)
            const material = new THREE[
                index === 0 ? 'MeshBasicMaterial' : 'MeshLambertMaterial'
            ]({
                map: new THREE.TextureLoader().load(planet.url)
            })
            const mesh = new THREE.Mesh(geometry, material)
            // 设置行星位置
            mesh.position.x = planet.distance
            scene.add(mesh)
            return {
                mesh,
                speed: planet.speed,
                distance: planet.distance
            }
        })
    }

    // 行星动画
    const animate = () => {
        planets.forEach((planet, index: number) => {
            // 自旋
            planet.mesh.rotation.y += (planet.speed > 0 ? planet.speed : 0.01) + 0.01
            // 公转
            planet.mesh.position.x = planet.distance * Math.cos(planet.mesh.rotation.y)
            planet.mesh.position.z = planet.distance * Math.sin(planet.mesh.rotation.y)
        })
        // 渲染
        renderer.render(scene, camera)
        // 背景星体运动
        starMesh.rotation.x += 0.0002;
        starMesh.rotation.y += 0.0002;
        starMesh.rotation.z += 0.0002;
        
        // 递归调用animate函数
        requestAnimationFrame(animate)
    }
 
    const renderScene = () => {
        // requestAnimationFrame(renderScene)
        renderer.render(scene, camera)
    }

    useEffect(() => {
        createPlanets()
        init()
        animate()
    })

    return <div id="planet" style={{ width: "100%", height: 900, color: 'black' }}>
    </div>
}

export default Planet