import { NextPage } from "next"
import { useEffect, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'


const Cube: NextPage = () => {
    let renderer: THREE.WebGLRenderer
    let scene: THREE.Scene
    let mesh: THREE.Mesh
    let camera: THREE.Camera

    const flag = useRef<boolean>(false)

    const initThree = () => {
        scene = new THREE.Scene()
        /**
         *  创建网格模型
         *
         **/
        // 创建一个球体
        // const geometry = new THREE.SphereGeometry(60, 40, 40)
        // 创建一个立方体
        const geometry = new THREE.BoxGeometry(100, 100, 100)
        // 材质对象
        const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 })
        // 网格模型对象
        mesh = new THREE.Mesh(geometry, material)
        // 将网格模型添加到场景中
        scene.add(mesh)

        const geometry1 = new THREE.SphereGeometry(60, 40, 40)
        // 材质对象
        const material1 = new THREE.MeshLambertMaterial({ color: 0x00ff00 })
        // 网格模型对象
        const mesh1 = new THREE.Mesh(geometry1, material1)
        mesh1.translateY(120)
        // 将网格模型添加到场景中
        scene.add(mesh1)

        /**
         * 光源设置
         */
        // 点光源
        const point = new THREE.PointLight(0xffffff)
        // 位置
        point.position.set(500, 200, 300)
        scene.add(point)
        // 环境光
        const ambient = new THREE.AmbientLight(0x444444)
        scene.add(ambient)

        /**
         * 相机设置
         */
        const cubeEl = document.getElementById("cube")!
        const width = cubeEl?.clientWidth
        const height = cubeEl?.clientHeight
        const k = width / height // 窗口宽高比
        const s = 300 // 三维场景显示范围控制系数，系数越大，显示的范围越大
        // 创建相机对象
        camera = new THREE.OrthographicCamera(
            -s * k,
            s * k,
            s,
            -s,
            1,
            1000
        )
        camera.position.set(200, 300, 200)
        camera.lookAt(scene.position) // 设置相机方向（指向的场景方向）
        
        /**
         * 辅助三维坐标系
         */
        const axisHelper = new THREE.AxesHelper(300)
        scene.add(axisHelper)

        /**
         * 创建渲染器对象
         */
        renderer = new THREE.WebGLRenderer()
        renderer.setSize(width, height)
        renderer.setClearColor(0xb9d3ff, 1)
        if (!flag.current) {
            cubeEl?.appendChild(renderer.domElement)
        }
        flag.current = true
        
        myRender()

        // 创建控件对象
        const controls = new OrbitControls(camera, renderer.domElement)
        // 已经通过requestAnimationFrame调用渲染函数，无需重复调用
        // controls.addEventListener('change', myRender) 
    }

    let T0 = new Date().getTime()
    const myRender = () => {
        // 执行渲染操作，指定场景、相机为参数
        // renderer.render(scene, camera);

        // 旋转效果
        // setInterval(() => {
        //     renderer.render(scene, camera)
        //     mesh.rotateY(0.01)
        // }, 20)

        // renderer.render(scene, camera)
        // mesh.rotateY(0.01)
        // requestAnimationFrame(myRender)

        // 均匀旋转
        let T1 = new Date().getTime()
        let t = T1 - T0
        T0 = T1
        requestAnimationFrame(myRender)
        renderer.render(scene, camera)
        mesh.rotateY(0.001 * t)
    }

    useEffect(() => {
        initThree()
    }, [])

    return <div id="cube" style={{ width: "100%", height: 900 }}></div>
}

export default Cube
