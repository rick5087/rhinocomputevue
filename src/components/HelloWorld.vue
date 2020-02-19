<template>
  <v-container>
    <v-row justify="space-around">
    <v-col cols="12">
      <v-slider
        v-model="countSlider"
        min="1"
        max="100"
        value="35"
        step="1"
        label="count"
        @change="compute"
      ></v-slider>
    </v-col>
    <v-col cols="12">
      <v-slider
        v-model="radiusSlider"
        min="0"
        max="10.00"
        value="5.00"
        step="0.1"
        label="radius"
        @change="compute"
      ></v-slider>
    </v-col>
    <v-col cols="12">
      <v-slider
        v-model="lengthSlider"
        min="0"
        max="10.00"
        value="1.00"
        step="0.1"
        label="length"
        @change="compute"
      ></v-slider>
    </v-col>
  </v-row>
  <div id="canvas"></div>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    countSlider: 35,
    radiusSlider: 5.00,
    lengthSlider: 1.00,
    args: {
      algo: null,
      pointer: null,
      values: []
    },
    camera: null,
    scene: null,
    controls: null,
    renderer: null,
    rhino: null
  }),
  mounted () {
    // load rhino3dm

    // because we'll be in some promises, we should redefine 'this', otherwise it will be undefined
    let self = this

    // eslint-disable-next-line
    rhino3dm().then(function (m) {
      console.log('Loaded rhino3dm.')
      // probably shouldn't do this, but we need it around
      self.rhino = m // global

      // authenticate
      // eslint-disable-next-line
      // RhinoCompute.authToken = RhinoCompute.getAuthToken()

      // if you have a different Rhino.Compute server, add the URL here:
      RhinoCompute.url = "http://localhost:80/";

      fetch('BranchNodeRnd.ghx')
        .then(response => response.text())
        .then(text => {
          self.args.algo = btoa(text)
          // console.log(self.args.algo)
          self.init()
          self.compute()
        })

      // let sphere = new self.rhino.Sphere([1, 2, 3], 12)
      // console.log(sphere)
    })
  },
  methods: {
    init () {
      // boilerplate three.js stuff
      // eslint-disable-next-line
      this.scene = new THREE.Scene()
      // eslint-disable-next-line
      this.scene.background = new THREE.Color(1, 1, 1)
      // eslint-disable-next-line
      this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000)
      // eslint-disable-next-line
      this.renderer = new THREE.WebGLRenderer({ antialias: true })
      this.renderer.setPixelRatio(window.devicePixelRatio)
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      var canvas = document.getElementById('canvas')
      canvas.appendChild(this.renderer.domElement)
      // eslint-disable-next-line
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement)

      this.camera.position.z = 50

      window.addEventListener('resize', this.onWindowResize, false)

      this.animate()
    },
    onWindowResize () {
      this.camera.aspect = window.innerWidth / window.innerHeight
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      this.animate()
    },
    animate () {
      requestAnimationFrame(this.animate)
      this.controls.update()
      this.renderer.render(this.scene, this.camera)
    },
    meshToThreejs (mesh, material) {
      // eslint-disable-next-line
      var geometry = new THREE.BufferGeometry()
      var vertices = mesh.vertices()
      var vertexbuffer = new Float32Array(3 * vertices.count)
      for (var i = 0; i < vertices.count; i++) {
        let pt = vertices.get(i)
        vertexbuffer[i * 3] = pt[0]
        vertexbuffer[i * 3 + 1] = pt[1]
        vertexbuffer[i * 3 + 2] = pt[2]
      }
      // itemSize = 3 because there are 3 values (components) per vertex
      // eslint-disable-next-line
      geometry.addAttribute('position', new THREE.BufferAttribute(vertexbuffer, 3))

      let indices = []
      var faces = mesh.faces()
      // eslint-disable-next-line
      for (var i = 0; i < faces.count; i++) {
        let face = faces.get(i)
        indices.push(face[0], face[1], face[2])
        if (face[2] !== face[3]) {
          indices.push(face[2], face[3], face[0])
        }
      }
      geometry.setIndex(indices)

      var normals = mesh.normals()
      var normalBuffer = new Float32Array(3 * normals.count)
      // eslint-disable-next-line
      for (var i = 0; i < normals.count; i++) {
        let pt = normals.get(i)
        normalBuffer[i * 3] = pt[0]
        normalBuffer[i * 3 + 1] = pt[1]
        normalBuffer[i * 3 + 2] = pt[1]
      }
      // eslint-disable-next-line
      geometry.addAttribute('normal', new THREE.BufferAttribute(normalBuffer, 3))
      // eslint-disable-next-line
      return new THREE.Mesh(geometry, material)
    },
    compute () {
      console.log('compute')

      this.args.values = []

      let param1 = {
        ParamName: 'RH_IN:201:Length',
        InnerTree: {
          '{ 0; }': [
            {
              'type': '',
              'data': this.lengthSlider
            }
          ]
        },
        Keys: [
          '{ 0; }'
        ],
        Values: [
          {
            'type': '',
            'data': this.lengthSlider
          }
        ]
      }

      let param2 = {
        ParamName: 'RH_IN:201:Radius',
        InnerTree: {
          '{ 0; }': [
            {
              'type': '',
              'data': this.radiusSlider
            }
          ]
        },
        Keys: [
          '{ 0; }'
        ],
        Values: [
          {
            'type': '',
            'data': this.radiusSlider
          }
        ]
      }

      let param3 = {
        ParamName: 'RH_IN:201:Count',
        InnerTree: {
          '{ 0; }': [
            {
              'type': '',
              'data': this.countSlider
            }
          ]
        },
        Keys: [
          '{ 0; }'
        ],
        Values: [
          {
            'type': '',
            'data': this.countSlider
          }
        ]
      }

      this.args.values.push(param1)
      this.args.values.push(param2)
      this.args.values.push(param3)

      console.log(this.args)

      // eslint-disable-next-line
      RhinoCompute.computeFetch('grasshopper', this.args).then(result => {
        console.log(result)
        console.log(result.values[0])
        console.log(result.values[0]["InnerTree"]["{ 0; }"][0])
        let data = JSON.parse(result.values[0]["InnerTree"]["{ 0; }"][0].data)
        let mesh = this.rhino.CommonObject.decode(data)
        // eslint-disable-next-line
        let material = new THREE.MeshNormalMaterial()
        let threeMesh = this.meshToThreejs(mesh, material)
        // clear mesh in scene
        this.scene.children = []
        this.scene.add(threeMesh)
      })
    }
  }
}
</script>
