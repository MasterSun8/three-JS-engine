import './style.css'

import * as THREE from 'three'

import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'

function aspectRatio(){
  return window.innerWidth/window.innerHeight
}

let objects = new Array()

function addObject(geometry, name){
  let mat = new THREE.MeshBasicMaterial({
    wireframe: true
  })

  mat.color.r = Math.random()
  mat.color.g = Math.random()
  mat.color.b = Math.random()
  let tempObject = new THREE.Mesh(geometry, mat)
  tempObject.name = name
  objects.push(tempObject)
}

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, aspectRatio(), 0.1, 1000)

const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#app')
})

renderer.setPixelRatio(window.devicePixelRatio)

renderer.setSize(window.innerWidth, window.innerHeight)
camera.position.setZ(30)

renderer.render(scene, camera)

const icosahedron = new THREE.IcosahedronGeometry(17, 5)
const cube = new THREE.BoxGeometry(20, 20, 20)

addObject(icosahedron, 'icosahedron')
addObject(cube, 'cube')

objects.forEach(obj => {
  scene.add(obj)
})

const controls = new OrbitControls(camera, renderer.domElement)

function animate(){
  requestAnimationFrame(animate)

  controls.update()
  objects[0].position.x = 50

  renderer.render(scene, camera)
}

document.addEventListener('mousedown', onDocumentMouseDown)
document.addEventListener('keydown', arrowHandling)

var xArrow
var yArrow
var zArrow
var chosen
var jump = 1

function arrowHandling(event){
  if(chosen){
    switch(event.keyCode){
      case 37:  //left
        chosen.position.x -= jump
        break;
      case 39:  //right
        chosen.position.x += jump
        break;
      case 38:  //up
        chosen.position.z -= jump
        break;
      case 40:  //down
        chosen.position.z += jump
        break;
      case 32:  //space
        chosen.position.y += jump
        break;
      case 16:  //shift
        chosen.position.y -= jump
        break;
      default:
        console.log(event.keyCode)
        break;
    }
  }
}

function onDocumentMouseDown(event) {
  if(event.button == 0){
    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1
    raycaster.setFromCamera(mouse, camera)
    let closest
    let distance = 0
    objects.forEach((obj, i) => {
      obj.remove(xArrow)
      obj.remove(yArrow)
      obj.remove(zArrow)
      let intersects = raycaster.intersectObject(obj)

      if (intersects.length > 0) {
        let vector = Array()
        vector.push(camera.position.x - intersects[0].object.position.x)
        vector.push(camera.position.y - intersects[0].object.position.y)
        vector.push(camera.position.z - intersects[0].object.position.z)
        let tempDistance = 0
        vector.forEach(el => {
          tempDistance += el*el
        })
        tempDistance = Math.sqrt(tempDistance) - intersects[0].object.geometry.boundingSphere.radius
        if(tempDistance < distance || !distance){
          distance = tempDistance
          closest = objects[i]
        }
      }
    })
    if(closest){
      chosen = closest
      xArrow = new THREE.ArrowHelper(new THREE.Vector3(2, 0, 0).normalize(), new THREE.Vector3(0, 0, 0), closest.geometry.boundingSphere.radius * 1.2, "blue")
      yArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 2, 0).normalize(), new THREE.Vector3(0, 0, 0), closest.geometry.boundingSphere.radius * 1.2, "red")
      zArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 2).normalize(), new THREE.Vector3(0, 0, 0), closest.geometry.boundingSphere.radius * 1.2, "green")
      closest.add(xArrow)
      closest.add(yArrow)
      closest.add(zArrow)
    }else{
      chosen = null
    }
  }
}

animate()