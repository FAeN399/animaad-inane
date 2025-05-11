// src/core/itemLibrary.js
import * as THREE from 'three';

/**
 * Library of 20 predefined geometric items for the Geometry Forge
 * Each item includes parameters for creation and a generator function
 */

// Export all items as a single array
export function getAllItems() {
    return [...itemLibrary, ...itemLibraryPart2];
}

export const itemLibrary = [
    // 1. Sacred Geometry: Merkaba
    {
        id: 'merkaba',
        name: 'Merkaba',
        category: 'sacred',
        description: 'Star tetrahedron representing light, spirit and body',
        generator: (params = {}) => {
            const size = params.size || 1;
            const group = new THREE.Group();
            group.name = 'Merkaba';

            // Create two tetrahedrons
            const tetraGeom = new THREE.TetrahedronGeometry(size, 0);

            // Upward tetrahedron
            const upTetra = new THREE.Mesh(
                tetraGeom,
                new THREE.MeshStandardMaterial({
                    color: params.color1 || 0x6495ED,
                    transparent: true,
                    opacity: 0.7
                })
            );

            // Downward tetrahedron
            const downTetra = new THREE.Mesh(
                tetraGeom,
                new THREE.MeshStandardMaterial({
                    color: params.color2 || 0xFFD700,
                    transparent: true,
                    opacity: 0.7
                })
            );

            // Rotate one tetrahedron
            downTetra.rotation.z = Math.PI;

            group.add(upTetra);
            group.add(downTetra);

            return group;
        }
    },

    // 2. Sacred Geometry: Flower of Life
    {
        id: 'flowerOfLife',
        name: 'Flower of Life',
        category: 'sacred',
        description: 'Ancient pattern of overlapping circles',
        generator: (params = {}) => {
            const radius = params.radius || 0.2;
            const rings = params.rings || 3;
            const group = new THREE.Group();
            group.name = 'Flower of Life';

            const material = new THREE.MeshStandardMaterial({
                color: params.color || 0x4682B4,
                transparent: true,
                opacity: 0.7,
                side: THREE.DoubleSide
            });

            // Create center circle
            const circleGeom = new THREE.CircleGeometry(radius, 32);
            const centerCircle = new THREE.Mesh(circleGeom, material);
            centerCircle.rotation.x = -Math.PI / 2; // Lay flat
            group.add(centerCircle);

            // Create rings of circles
            for (let ring = 1; ring <= rings; ring++) {
                const ringRadius = radius * 2 * ring;
                const numCircles = 6 * ring;

                for (let i = 0; i < numCircles; i++) {
                    const angle = (i / numCircles) * Math.PI * 2;
                    const x = Math.cos(angle) * ringRadius;
                    const z = Math.sin(angle) * ringRadius;

                    const circle = new THREE.Mesh(circleGeom, material);
                    circle.position.set(x, 0, z);
                    circle.rotation.x = -Math.PI / 2; // Lay flat
                    group.add(circle);
                }
            }

            return group;
        }
    },

    // 3. Sacred Geometry: Metatron's Cube
    {
        id: 'metatronsCube',
        name: 'Metatron\'s Cube',
        category: 'sacred',
        description: 'Sacred geometric figure containing all Platonic solids',
        generator: (params = {}) => {
            const size = params.size || 1;
            const group = new THREE.Group();
            group.name = 'Metatron\'s Cube';

            const material = new THREE.LineBasicMaterial({
                color: params.color || 0xFFFFFF
            });

            // Create 13 spheres at vertices
            const sphereGeom = new THREE.SphereGeometry(size * 0.05, 16, 16);
            const sphereMat = new THREE.MeshStandardMaterial({
                color: params.sphereColor || 0xFFD700
            });

            // Center sphere
            const centerSphere = new THREE.Mesh(sphereGeom, sphereMat);
            group.add(centerSphere);

            // First ring - 6 spheres
            const positions = [];
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                const x = Math.cos(angle) * size * 0.5;
                const z = Math.sin(angle) * size * 0.5;

                const sphere = new THREE.Mesh(sphereGeom, sphereMat);
                sphere.position.set(x, 0, z);
                group.add(sphere);
                positions.push(new THREE.Vector3(x, 0, z));
            }

            // Second ring - 6 spheres
            for (let i = 0; i < 6; i++) {
                const angle = ((i / 6) * Math.PI * 2) + (Math.PI / 6);
                const x = Math.cos(angle) * size;
                const z = Math.sin(angle) * size;

                const sphere = new THREE.Mesh(sphereGeom, sphereMat);
                sphere.position.set(x, 0, z);
                group.add(sphere);
                positions.push(new THREE.Vector3(x, 0, z));
            }

            // Connect lines between all spheres
            for (let i = 0; i < positions.length; i++) {
                for (let j = i + 1; j < positions.length; j++) {
                    const lineGeom = new THREE.BufferGeometry().setFromPoints([
                        positions[i], positions[j]
                    ]);
                    const line = new THREE.Line(lineGeom, material);
                    group.add(line);
                }
            }

            return group;
        }
    },

    // 4. Sacred Geometry: Sri Yantra
    {
        id: 'sriYantra',
        name: 'Sri Yantra',
        category: 'sacred',
        description: 'Ancient Hindu geometric pattern of interlocking triangles',
        generator: (params = {}) => {
            const size = params.size || 1;
            const group = new THREE.Group();
            group.name = 'Sri Yantra';

            const material = new THREE.LineBasicMaterial({
                color: params.color || 0xFFFFFF
            });

            // Create 9 interlocking triangles
            // 4 pointing upward, 5 pointing downward
            const trianglePoints = [
                // Upward triangles
                [
                    [0, 0, -size], [-size, 0, size/2], [size, 0, size/2]
                ],
                [
                    [0, 0, -size*0.8], [-size*0.8, 0, size*0.4], [size*0.8, 0, size*0.4]
                ],
                [
                    [0, 0, -size*0.6], [-size*0.6, 0, size*0.3], [size*0.6, 0, size*0.3]
                ],
                [
                    [0, 0, -size*0.4], [-size*0.4, 0, size*0.2], [size*0.4, 0, size*0.2]
                ],

                // Downward triangles
                [
                    [0, 0, size], [-size, 0, -size/2], [size, 0, -size/2]
                ],
                [
                    [0, 0, size*0.8], [-size*0.8, 0, -size*0.4], [size*0.8, 0, -size*0.4]
                ],
                [
                    [0, 0, size*0.6], [-size*0.6, 0, -size*0.3], [size*0.6, 0, -size*0.3]
                ],
                [
                    [0, 0, size*0.4], [-size*0.4, 0, -size*0.2], [size*0.4, 0, -size*0.2]
                ],
                [
                    [0, 0, size*0.2], [-size*0.2, 0, -size*0.1], [size*0.2, 0, -size*0.1]
                ]
            ];

            // Create triangles
            trianglePoints.forEach((points, index) => {
                const lineGeom1 = new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(...points[0]),
                    new THREE.Vector3(...points[1])
                ]);
                const lineGeom2 = new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(...points[1]),
                    new THREE.Vector3(...points[2])
                ]);
                const lineGeom3 = new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(...points[2]),
                    new THREE.Vector3(...points[0])
                ]);

                const line1 = new THREE.Line(lineGeom1, material);
                const line2 = new THREE.Line(lineGeom2, material);
                const line3 = new THREE.Line(lineGeom3, material);

                group.add(line1);
                group.add(line2);
                group.add(line3);
            });

            // Add central dot (bindu)
            const binduGeom = new THREE.SphereGeometry(size * 0.05, 16, 16);
            const binduMat = new THREE.MeshStandardMaterial({
                color: params.binduColor || 0xFF0000
            });
            const bindu = new THREE.Mesh(binduGeom, binduMat);
            group.add(bindu);

            // Rotate to lay flat
            group.rotation.x = -Math.PI / 2;

            return group;
        }
    },

    // 5. Sacred Geometry: Seed of Life
    {
        id: 'seedOfLife',
        name: 'Seed of Life',
        category: 'sacred',
        description: 'Seven overlapping circles forming a hexagonal pattern',
        generator: (params = {}) => {
            const radius = params.radius || 0.5;
            const group = new THREE.Group();
            group.name = 'Seed of Life';

            const material = new THREE.MeshStandardMaterial({
                color: params.color || 0x9370DB,
                transparent: true,
                opacity: 0.7,
                side: THREE.DoubleSide
            });

            const circleGeom = new THREE.CircleGeometry(radius, 32);

            // Center circle
            const centerCircle = new THREE.Mesh(circleGeom, material);
            centerCircle.rotation.x = -Math.PI / 2; // Lay flat
            group.add(centerCircle);

            // Six surrounding circles
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;

                const circle = new THREE.Mesh(circleGeom, material);
                circle.position.set(x, 0, z);
                circle.rotation.x = -Math.PI / 2; // Lay flat
                group.add(circle);
            }

            return group;
        }
    }
];

// Continue with more items...
export const itemLibraryPart2 = [
    // 6. Sacred Geometry: Vesica Piscis
    {
        id: 'vesicaPiscis',
        name: 'Vesica Piscis',
        category: 'sacred',
        description: 'Two overlapping circles creating an almond shape',
        generator: (params = {}) => {
            const radius = params.radius || 0.5;
            const group = new THREE.Group();
            group.name = 'Vesica Piscis';

            const material = new THREE.MeshStandardMaterial({
                color: params.color || 0x00CED1,
                transparent: true,
                opacity: 0.7,
                side: THREE.DoubleSide
            });

            const circleGeom = new THREE.CircleGeometry(radius, 32);

            // Left circle
            const leftCircle = new THREE.Mesh(circleGeom, material);
            leftCircle.position.set(-radius/2, 0, 0);
            leftCircle.rotation.x = -Math.PI / 2; // Lay flat
            group.add(leftCircle);

            // Right circle
            const rightCircle = new THREE.Mesh(circleGeom, material);
            rightCircle.position.set(radius/2, 0, 0);
            rightCircle.rotation.x = -Math.PI / 2; // Lay flat
            group.add(rightCircle);

            return group;
        }
    },

    // 7. Sacred Geometry: Torus
    {
        id: 'torus',
        name: 'Torus',
        category: 'sacred',
        description: 'Donut-shaped surface of revolution',
        generator: (params = {}) => {
            const radius = params.radius || 1;
            const tubeRadius = params.tubeRadius || 0.4;
            const radialSegments = params.radialSegments || 16;
            const tubularSegments = params.tubularSegments || 100;

            const geometry = new THREE.TorusGeometry(
                radius,
                tubeRadius,
                radialSegments,
                tubularSegments
            );

            const material = new THREE.MeshStandardMaterial({
                color: params.color || 0xFFA500,
                wireframe: params.wireframe || false
            });

            const torus = new THREE.Mesh(geometry, material);
            torus.name = 'Torus';

            return torus;
        }
    },

    // 8. Sacred Geometry: Vector Equilibrium (Cuboctahedron)
    {
        id: 'vectorEquilibrium',
        name: 'Vector Equilibrium',
        category: 'sacred',
        description: 'Cuboctahedron with equal vectors from center to vertices',
        generator: (params = {}) => {
            const radius = params.radius || 1;

            // Create a cuboctahedron
            const geometry = new THREE.PolyhedronGeometry(
                // Vertices
                [
                    1, 0, 0, -1, 0, 0, 0, 1, 0,
                    0, -1, 0, 0, 0, 1, 0, 0, -1
                ],
                // Faces
                [
                    0, 2, 4, 0, 4, 3, 0, 3, 5, 0, 5, 2,
                    1, 2, 5, 1, 5, 3, 1, 3, 4, 1, 4, 2
                ],
                radius, 0
            );

            const material = new THREE.MeshStandardMaterial({
                color: params.color || 0x4169E1,
                flatShading: true
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.name = 'Vector Equilibrium';

            return mesh;
        }
    },

    // 9. Platonic Solid: Icosahedron
    {
        id: 'icosahedron',
        name: 'Icosahedron',
        category: 'platonic',
        description: 'Platonic solid with 20 triangular faces',
        generator: (params = {}) => {
            const radius = params.radius || 1;
            const detail = params.detail || 0;

            const geometry = new THREE.IcosahedronGeometry(radius, detail);

            const material = new THREE.MeshStandardMaterial({
                color: params.color || 0x7B68EE,
                flatShading: true,
                wireframe: params.wireframe || false
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.name = 'Icosahedron';

            return mesh;
        }
    },

    // 10. Platonic Solid: Dodecahedron
    {
        id: 'dodecahedron',
        name: 'Dodecahedron',
        category: 'platonic',
        description: 'Platonic solid with 12 pentagonal faces',
        generator: (params = {}) => {
            const radius = params.radius || 1;
            const detail = params.detail || 0;

            const geometry = new THREE.DodecahedronGeometry(radius, detail);

            const material = new THREE.MeshStandardMaterial({
                color: params.color || 0x20B2AA,
                flatShading: true,
                wireframe: params.wireframe || false
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.name = 'Dodecahedron';

            return mesh;
        }
    },

    // 11. Platonic Solid: Octahedron
    {
        id: 'octahedron',
        name: 'Octahedron',
        category: 'platonic',
        description: 'Platonic solid with 8 triangular faces',
        generator: (params = {}) => {
            const radius = params.radius || 1;
            const detail = params.detail || 0;

            const geometry = new THREE.OctahedronGeometry(radius, detail);

            const material = new THREE.MeshStandardMaterial({
                color: params.color || 0xDA70D6,
                flatShading: true,
                wireframe: params.wireframe || false
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.name = 'Octahedron';

            return mesh;
        }
    },

    // 12. Platonic Solid: Tetrahedron
    {
        id: 'tetrahedron',
        name: 'Tetrahedron',
        category: 'platonic',
        description: 'Platonic solid with 4 triangular faces',
        generator: (params = {}) => {
            const radius = params.radius || 1;
            const detail = params.detail || 0;

            const geometry = new THREE.TetrahedronGeometry(radius, detail);

            const material = new THREE.MeshStandardMaterial({
                color: params.color || 0xFF6347,
                flatShading: true,
                wireframe: params.wireframe || false
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.name = 'Tetrahedron';

            return mesh;
        }
    },

    // 13. Platonic Solid: Cube (Hexahedron)
    {
        id: 'cube',
        name: 'Cube',
        category: 'platonic',
        description: 'Platonic solid with 6 square faces',
        generator: (params = {}) => {
            const size = params.size || 1;

            const geometry = new THREE.BoxGeometry(size, size, size);

            const material = new THREE.MeshStandardMaterial({
                color: params.color || 0x1E90FF,
                flatShading: true,
                wireframe: params.wireframe || false
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.name = 'Cube';

            return mesh;
        }
    },

    // 14. Archimedean Solid: Truncated Icosahedron (Soccer Ball)
    {
        id: 'soccerBall',
        name: 'Soccer Ball',
        category: 'archimedean',
        description: 'Truncated icosahedron with pentagonal and hexagonal faces',
        generator: (params = {}) => {
            const radius = params.radius || 1;

            // Create a sphere as base
            const geometry = new THREE.SphereGeometry(radius, 32, 16);

            // Create a material with soccer ball texture
            const material = new THREE.MeshStandardMaterial({
                color: params.color || 0xFFFFFF,
                flatShading: false
            });

            // Create a pattern of pentagons and hexagons
            if (params.pattern !== false) {
                const texture = new THREE.TextureLoader().load('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
                material.map = texture;
            }

            const mesh = new THREE.Mesh(geometry, material);
            mesh.name = 'Soccer Ball';

            return mesh;
        }
    },

    // 15. Archimedean Solid: Truncated Cube
    {
        id: 'truncatedCube',
        name: 'Truncated Cube',
        category: 'archimedean',
        description: 'Cube with corners cut off, creating octagonal faces',
        generator: (params = {}) => {
            const size = params.size || 1;
            const group = new THREE.Group();
            group.name = 'Truncated Cube';

            // Create a cube
            const cubeGeom = new THREE.BoxGeometry(size * 0.8, size * 0.8, size * 0.8);
            const cubeMat = new THREE.MeshStandardMaterial({
                color: params.color || 0x3CB371,
                flatShading: true
            });
            const cube = new THREE.Mesh(cubeGeom, cubeMat);
            group.add(cube);

            // Add spheres at corners to create truncated effect
            const sphereGeom = new THREE.SphereGeometry(size * 0.25, 16, 16);
            const sphereMat = new THREE.MeshStandardMaterial({
                color: params.cornerColor || 0xFFD700,
                flatShading: true
            });

            // Place spheres at the 8 corners of the cube
            const corners = [
                [1, 1, 1], [1, 1, -1], [1, -1, 1], [1, -1, -1],
                [-1, 1, 1], [-1, 1, -1], [-1, -1, 1], [-1, -1, -1]
            ];

            corners.forEach(pos => {
                const sphere = new THREE.Mesh(sphereGeom, sphereMat);
                sphere.position.set(
                    pos[0] * size * 0.4,
                    pos[1] * size * 0.4,
                    pos[2] * size * 0.4
                );
                group.add(sphere);
            });

            return group;
        }
    },

    // 16. Archimedean Solid: Rhombicosidodecahedron
    {
        id: 'rhombicosidodecahedron',
        name: 'Rhombicosidodecahedron',
        category: 'archimedean',
        description: 'Complex polyhedron with squares, triangles, and pentagons',
        generator: (params = {}) => {
            const radius = params.radius || 1;
            const detail = params.detail || 0;

            // Approximate with an icosphere with high detail
            const geometry = new THREE.IcosahedronGeometry(radius, 1 + detail);

            const material = new THREE.MeshStandardMaterial({
                color: params.color || 0xE6E6FA,
                flatShading: true,
                wireframe: params.wireframe || false
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.name = 'Rhombicosidodecahedron';

            return mesh;
        }
    },

    // 17. Mandala: Lotus
    {
        id: 'lotus',
        name: 'Lotus Mandala',
        category: 'mandala',
        description: 'Lotus flower pattern with concentric petals',
        generator: (params = {}) => {
            const radius = params.radius || 1;
            const layers = params.layers || 3;
            const petalsPerLayer = params.petalsPerLayer || 8;

            const group = new THREE.Group();
            group.name = 'Lotus Mandala';

            // Create center
            const centerGeom = new THREE.CircleGeometry(radius * 0.2, 32);
            const centerMat = new THREE.MeshStandardMaterial({
                color: params.centerColor || 0xFFD700,
                side: THREE.DoubleSide
            });
            const center = new THREE.Mesh(centerGeom, centerMat);
            center.rotation.x = -Math.PI / 2; // Lay flat
            group.add(center);

            // Create petal layers
            for (let layer = 0; layer < layers; layer++) {
                const layerRadius = radius * (0.4 + layer * 0.2);
                const petalLength = radius * (0.3 + layer * 0.1);
                const petalWidth = (2 * Math.PI * layerRadius) / petalsPerLayer * 0.5;

                const petalColor = params[`layer${layer}Color`] || new THREE.Color().setHSL(layer * 0.1, 0.7, 0.5);

                for (let i = 0; i < petalsPerLayer; i++) {
                    const angle = (i / petalsPerLayer) * Math.PI * 2;

                    // Create petal shape
                    const petalShape = new THREE.Shape();
                    petalShape.moveTo(0, 0);
                    petalShape.ellipse(0, petalLength / 2, petalWidth / 2, petalLength / 2, 0, 0, Math.PI * 2);

                    const petalGeom = new THREE.ShapeGeometry(petalShape);
                    const petalMat = new THREE.MeshStandardMaterial({
                        color: petalColor,
                        side: THREE.DoubleSide,
                        transparent: true,
                        opacity: 0.9
                    });

                    const petal = new THREE.Mesh(petalGeom, petalMat);
                    petal.position.set(
                        Math.cos(angle) * layerRadius,
                        0,
                        Math.sin(angle) * layerRadius
                    );
                    petal.rotation.x = -Math.PI / 2; // Lay flat
                    petal.rotation.z = -angle + Math.PI / 2; // Orient petal

                    group.add(petal);
                }
            }

            return group;
        }
    },

    // 18. Mandala: Chakra
    {
        id: 'chakra',
        name: 'Chakra Wheel',
        category: 'mandala',
        description: 'Energy center representation with spokes and symbols',
        generator: (params = {}) => {
            const radius = params.radius || 1;
            const spokes = params.spokes || 7; // 7 chakras

            const group = new THREE.Group();
            group.name = 'Chakra Wheel';

            // Create outer circle
            const outerRingGeom = new THREE.RingGeometry(radius * 0.9, radius, 64);
            const outerRingMat = new THREE.MeshStandardMaterial({
                color: params.ringColor || 0x9C27B0,
                side: THREE.DoubleSide
            });
            const outerRing = new THREE.Mesh(outerRingGeom, outerRingMat);
            outerRing.rotation.x = -Math.PI / 2; // Lay flat
            group.add(outerRing);

            // Create inner circle
            const innerCircleGeom = new THREE.CircleGeometry(radius * 0.3, 32);
            const innerCircleMat = new THREE.MeshStandardMaterial({
                color: params.centerColor || 0xE91E63,
                side: THREE.DoubleSide
            });
            const innerCircle = new THREE.Mesh(innerCircleGeom, innerCircleMat);
            innerCircle.rotation.x = -Math.PI / 2; // Lay flat
            group.add(innerCircle);

            // Create spokes
            for (let i = 0; i < spokes; i++) {
                const angle = (i / spokes) * Math.PI * 2;

                // Create spoke line
                const points = [
                    new THREE.Vector3(0, 0, 0),
                    new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius)
                ];

                const spokeGeom = new THREE.BufferGeometry().setFromPoints(points);
                const spokeMat = new THREE.LineBasicMaterial({
                    color: new THREE.Color().setHSL(i / spokes, 0.8, 0.5),
                    linewidth: 2
                });

                const spoke = new THREE.Line(spokeGeom, spokeMat);
                group.add(spoke);

                // Add symbol at end of spoke
                const symbolGeom = new THREE.CircleGeometry(radius * 0.1, 16);
                const symbolMat = new THREE.MeshStandardMaterial({
                    color: new THREE.Color().setHSL(i / spokes, 0.8, 0.5),
                    side: THREE.DoubleSide
                });

                const symbol = new THREE.Mesh(symbolGeom, symbolMat);
                symbol.position.set(
                    Math.cos(angle) * radius * 0.75,
                    0,
                    Math.sin(angle) * radius * 0.75
                );
                symbol.rotation.x = -Math.PI / 2; // Lay flat
                group.add(symbol);
            }

            return group;
        }
    },

    // 19. Kabbalistic: Tree of Life
    {
        id: 'treeOfLife',
        name: 'Tree of Life',
        category: 'kabbalistic',
        description: 'Kabbalistic symbol representing the cosmos',
        generator: (params = {}) => {
            const size = params.size || 1;
            const group = new THREE.Group();
            group.name = 'Tree of Life';

            // Sephirot positions (10 spheres)
            const positions = [
                [0, size * 0.9, 0],      // Keter (Crown)
                [-size * 0.3, size * 0.7, 0],  // Chokmah (Wisdom)
                [size * 0.3, size * 0.7, 0],   // Binah (Understanding)
                [0, size * 0.5, 0],      // Daat (Knowledge) - sometimes hidden
                [-size * 0.3, size * 0.3, 0],  // Chesed (Kindness)
                [size * 0.3, size * 0.3, 0],   // Gevurah (Severity)
                [0, size * 0.1, 0],      // Tiferet (Beauty)
                [-size * 0.3, -size * 0.1, 0], // Netzach (Victory)
                [size * 0.3, -size * 0.1, 0],  // Hod (Splendor)
                [0, -size * 0.3, 0],     // Yesod (Foundation)
                [0, -size * 0.7, 0]      // Malkuth (Kingdom)
            ];

            // Create spheres for each Sephirot
            const sphereGeom = new THREE.SphereGeometry(size * 0.08, 16, 16);

            positions.forEach((pos, index) => {
                // Different color for each Sephirot
                const color = new THREE.Color().setHSL(index / positions.length, 0.8, 0.5);
                const sphereMat = new THREE.MeshStandardMaterial({
                    color: params[`sphere${index}Color`] || color,
                    emissive: params[`sphere${index}Emissive`] || color.clone().multiplyScalar(0.2)
                });

                const sphere = new THREE.Mesh(sphereGeom, sphereMat);
                sphere.position.set(...pos);
                group.add(sphere);
            });

            // Create paths (22 connecting lines)
            const lineMat = new THREE.LineBasicMaterial({
                color: params.lineColor || 0xFFFFFF
            });

            // Define the connections between Sephirot
            const connections = [
                [0, 1], [0, 2], [1, 2], [1, 4], [2, 5],
                [4, 5], [4, 7], [5, 8], [7, 8], [7, 9],
                [8, 9], [9, 10], [6, 7], [6, 8], [6, 9],
                [3, 6], [1, 3], [2, 3], [3, 4], [3, 5],
                [0, 3], [6, 10]
            ];

            connections.forEach(([from, to]) => {
                const points = [
                    new THREE.Vector3(...positions[from]),
                    new THREE.Vector3(...positions[to])
                ];

                const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
                const line = new THREE.Line(lineGeom, lineMat);
                group.add(line);
            });

            return group;
        }
    },

    // 20. Kabbalistic: Tetractys
    {
        id: 'tetractys',
        name: 'Tetractys',
        category: 'kabbalistic',
        description: 'Triangular figure of ten points arranged in four rows',
        generator: (params = {}) => {
            const size = params.size || 1;
            const group = new THREE.Group();
            group.name = 'Tetractys';

            // Define positions for the 10 points in a triangle
            const positions = [
                // Row 1 (top)
                [0, size * 0.8, 0],
                // Row 2
                [-size * 0.2, size * 0.4, 0],
                [size * 0.2, size * 0.4, 0],
                // Row 3
                [-size * 0.4, 0, 0],
                [0, 0, 0],
                [size * 0.4, 0, 0],
                // Row 4 (bottom)
                [-size * 0.6, -size * 0.4, 0],
                [-size * 0.2, -size * 0.4, 0],
                [size * 0.2, -size * 0.4, 0],
                [size * 0.6, -size * 0.4, 0]
            ];

            // Create spheres for each point
            const sphereGeom = new THREE.SphereGeometry(size * 0.06, 16, 16);
            const sphereMat = new THREE.MeshStandardMaterial({
                color: params.pointColor || 0xFFD700
            });

            positions.forEach(pos => {
                const sphere = new THREE.Mesh(sphereGeom, sphereMat);
                sphere.position.set(...pos);
                group.add(sphere);
            });

            // Create lines connecting the points
            const lineMat = new THREE.LineBasicMaterial({
                color: params.lineColor || 0xFFFFFF
            });

            // Outer triangle
            const outerTrianglePoints = [
                new THREE.Vector3(...positions[0]),
                new THREE.Vector3(...positions[6]),
                new THREE.Vector3(...positions[9]),
                new THREE.Vector3(...positions[0])
            ];

            const outerTriangleGeom = new THREE.BufferGeometry().setFromPoints(outerTrianglePoints);
            const outerTriangle = new THREE.Line(outerTriangleGeom, lineMat);
            group.add(outerTriangle);

            // Connect all points with lines
            for (let i = 0; i < positions.length; i++) {
                for (let j = i + 1; j < positions.length; j++) {
                    // Skip some connections to avoid a messy look
                    if (Math.random() > 0.3) continue;

                    const points = [
                        new THREE.Vector3(...positions[i]),
                        new THREE.Vector3(...positions[j])
                    ];

                    const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
                    const line = new THREE.Line(lineGeom, lineMat);
                    group.add(line);
                }
            }

            return group;
        }
    }
];