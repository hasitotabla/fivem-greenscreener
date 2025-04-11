export const SCREENSHOT_VERTEX_SHADER = `
    varying vec2 vUv;
	void main() {
		vUv = vec2(uv.x, 1.0-uv.y); // fuck gl uv coords
		gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
`;

export const SCREENSHOT_FRAGMENT_SHADER = `
    varying vec2 vUv;
	uniform sampler2D tDiffuse;

    void main() {
		gl_FragColor = texture2D( tDiffuse, vUv );
    }
`;
