var DEMO = {
	ms_Canvas: null,
	ms_Renderer: null,
	ms_Camera: null, 
	ms_Scene: null, 
	ms_Controls: null,
	ms_Water: null,

    enable: (function enable() {
        try {
            var aCanvas = document.createElement('canvas');
            return !! window.WebGLRenderingContext && (aCanvas.getContext('webgl') || aCanvas.getContext('experimental-webgl'));
        }
        catch(e) {
            return false;
        }
    })(),
	
	initialize: function initialize(inIdCanvas) {
		this.ms_Canvas = $('#'+inIdCanvas);
        var render;
		
		// Initialize Renderer, Camera and Scene
		this.ms_Renderer = this.enable? new THREE.WebGLRenderer({ antialias: true }) : new THREE.CanvasRenderer();
		this.ms_Canvas.html(this.ms_Renderer.domElement);
		this.ms_Scene = new Physijs.Scene();
		
		this.ms_Camera = new THREE.PerspectiveCamera(55.0, WINDOW.ms_Width / WINDOW.ms_Height, 0.5, 3000000);
		this.ms_Camera.position.set(1000, 500, -1500);
		this.ms_Camera.lookAt(new THREE.Vector3(0, 0, 0));
        
        // Add Box
        var box = new Physijs.BoxMesh(
            new THREE.CubeGeometry( 5, 5, 5 ),
            new THREE.MeshBasicMaterial({ color: 0x888888 })
        );
//        this.ms_scene.add( box );
//        requestAnimationFrame( this.render );
        render = function() {
            scene.simulate(); // run physics
            renderer.render( this.ms_scene, this.ms_camera); // render the scene
            requestAnimationFrame( this.render );
        };
		
		// Initialize Orbit control		
		this.ms_Controls = new THREE.OrbitControls(this.ms_Camera, this.ms_Renderer.domElement);
	
		// Add light
		var directionalLight = new THREE.DirectionalLight(0xffff55, 1);
		directionalLight.position.set(-600, 300, 600);
		this.ms_Scene.add(directionalLight);
		
		// Load textures		
		var waterNormals = new THREE.ImageUtils.loadTexture('img/waternormals.jpg');
		waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping; 
		
		// Create the water effect
		this.ms_Water = new THREE.Water(this.ms_Renderer, this.ms_Camera, this.ms_Scene, {
			textureWidth: 256,
			textureHeight: 256,
			waterNormals: waterNormals,
			alpha: 	1.0,
			sunDirection: directionalLight.position.normalize(),
			sunColor: 0xffffff,
			waterColor: 0x001e0f,
			betaVersion: 0,
			side: THREE.DoubleSide
		});
		var aMeshMirror = new THREE.Mesh(
			new THREE.PlaneGeometry(2000, 2000, 100, 100), 
			this.ms_Water.material
		);
		aMeshMirror.add(this.ms_Water);
		aMeshMirror.rotation.x = - Math.PI * 0.5;
		
		this.ms_Scene.add(aMeshMirror);
	
		this.loadSkyBox();
	},
	
	loadSkyBox: function loadSkyBox() {
		var aCubeMap = THREE.ImageUtils.loadTextureCube([
		  'img/px.jpg',
		  'img/nx.jpg',
		  'img/py.jpg',
		  'img/ny.jpg',
		  'img/pz.jpg',
		  'img/nz.jpg'
		]);
		aCubeMap.format = THREE.RGBFormat;

		var aShader = THREE.ShaderLib['cube'];
		aShader.uniforms['tCube'].value = aCubeMap;

		var aSkyBoxMaterial = new THREE.ShaderMaterial({
		  fragmentShader: aShader.fragmentShader,
		  vertexShader: aShader.vertexShader,
		  uniforms: aShader.uniforms,
		  depthWrite: false,
		  side: THREE.BackSide
		});

		var aSkybox = new THREE.Mesh(
		  new THREE.CubeGeometry(1000000, 1000000, 1000000),
		  aSkyBoxMaterial
		);
		
		this.ms_Scene.add(aSkybox);
	},

    display: function display() {
		this.ms_Water.render();
		this.ms_Renderer.render(this.ms_Scene, this.ms_Camera);
	},
	
	update: function update() {
		this.ms_Water.material.uniforms.time.value += 1.0 / 60.0;
		this.ms_Controls.update();
		this.display();
	},
	
	resize: function resize(inWidth, inHeight) {
		this.ms_Camera.aspect =  inWidth / inHeight;
		this.ms_Camera.updateProjectionMatrix();
		this.ms_Renderer.setSize(inWidth, inHeight);
		this.ms_Canvas.html(this.ms_Renderer.domElement);
		this.display();
	}
};