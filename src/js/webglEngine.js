/* =========================================================================
   WebGL Engine Module: Handles custom shader pipelines, color preset Databases,
   state interpolations, and high-performance render draw calls.
   ========================================================================= */

let gl = null;
let program = null;
let posBuffer = null;
let positionAttrLoc = -1;
let uLoc = {};

// Color Presets Database (Diagonal waves only, locked shape = 0.0)
export const presets = {
    chrome: {
        colorDark: [0.03, 0.03, 0.04],
        colorLight: [0.38, 0.4, 0.45],
        colorSpecular: [1.0, 1.0, 1.0],
        roughness: 75.0,
        dispersion: 0.25,
        frequency: 2.2,
        speed: 0.45,
        shape: 0.0
    },
    obsidian: {
        colorDark: [0.015, 0.005, 0.03],
        colorLight: [0.08, 0.05, 0.16],
        colorSpecular: [0.55, 0.35, 1.0],
        roughness: 110.0,
        dispersion: 0.35,
        frequency: 1.8,
        speed: 0.32,
        shape: 0.0
    },
    gold: {
        colorDark: [0.04, 0.02, 0.01],
        colorLight: [0.45, 0.32, 0.12],
        colorSpecular: [1.0, 0.82, 0.45],
        roughness: 55.0,
        dispersion: 0.12,
        frequency: 2.4,
        speed: 0.38,
        shape: 0.0
    },
    cyberpunk: {
        colorDark: [0.02, 0.0, 0.03],
        colorLight: [0.08, 0.25, 0.3],
        colorSpecular: [1.0, 0.05, 0.75],
        roughness: 80.0,
        dispersion: 0.58,
        frequency: 2.6,
        speed: 0.65,
        shape: 0.0
    },
    disco: {
        colorDark: [0.012, 0.001, 0.03], 
        colorLight: [0.2, 0.04, 0.3],   
        colorSpecular: [1.0, 0.42, 0.12],
        roughness: 60.0,
        dispersion: 0.68,                 
        frequency: 2.6,
        speed: 0.55,
        shape: 0.0
    }
};

export let currentParams = JSON.parse(JSON.stringify(presets.disco));
export let targetParams = JSON.parse(JSON.stringify(presets.disco));
const lerpFactor = 0.04;

function lerp(a, b, f) {
    return a + (b - a) * f;
}

export function updateUniforms() {
    currentParams.roughness = lerp(currentParams.roughness, targetParams.roughness, lerpFactor);
    currentParams.dispersion = lerp(currentParams.dispersion, targetParams.dispersion, lerpFactor);
    currentParams.frequency = lerp(currentParams.frequency, targetParams.frequency, lerpFactor);
    currentParams.speed = lerp(currentParams.speed, targetParams.speed, lerpFactor);
    currentParams.shape = lerp(currentParams.shape, targetParams.shape, lerpFactor);

    for (let i = 0; i < 3; i++) {
        currentParams.colorDark[i] = lerp(currentParams.colorDark[i], targetParams.colorDark[i], lerpFactor);
        currentParams.colorLight[i] = lerp(currentParams.colorLight[i], targetParams.colorLight[i], lerpFactor);
        currentParams.colorSpecular[i] = lerp(currentParams.colorSpecular[i], targetParams.colorSpecular[i], lerpFactor);
    }
}

export function selectPreset(name) {
    const p = presets[name];
    if (!p) return;
    targetParams.roughness = p.roughness;
    targetParams.dispersion = p.dispersion;
    targetParams.frequency = p.frequency;
    targetParams.speed = p.speed;
    targetParams.shape = p.shape;
    targetParams.colorDark = [...p.colorDark];
    targetParams.colorLight = [...p.colorLight];
    targetParams.colorSpecular = [...p.colorSpecular];
}

// Vertex Shader
const vsSource = `
    attribute vec2 position;
    void main() {
        gl_Position = vec4(position, 0.0, 1.0);
    }
`;

// Fragment Shader (deep pixel coordinates, 3D refraction, chromatic dispersion)
const fsSource = `
    precision highp float;
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform vec2 u_mouse;
    uniform float u_scroll;

    uniform vec3 u_color_dark;
    uniform vec3 u_color_light;
    uniform vec3 u_color_specular;
    uniform float u_roughness;
    uniform float u_chromatic_dispersion;
    uniform float u_wave_frequency;
    uniform float u_wave_speed;
    uniform float u_shape; // Kept for uniform compatibility

    float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
    }

    float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }

    float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        vec2 shift = vec2(100.0);
        mat2 rot = mat2(0.819, 0.573, -0.573, 0.819);
        for (int i = 0; i < 3; ++i) {
            v += a * noise(p);
            p = rot * p * 2.0 + shift;
            a *= 0.5;
        }
        return v;
    }

    float getWaves(vec2 dp, float t) {
        return sin(dp.y * u_wave_frequency + t * u_wave_speed);
    }

    // Always diagonal waves geometry (shape = 0.0)
    float waveHeight(vec2 p, float t) {
        vec2 dp = p;
        dp.y += fbm(p * 0.35 + t * 0.12) * 0.6;
        dp.x += sin(p.y * 0.45 + t * 0.2) * 0.15;
        
        float w = getWaves(dp, t);
        w = w * 0.5 + 0.5;
        return pow(w, 3.0);
    }

    vec3 getNormal(vec2 p, float t, float eps) {
        float h = waveHeight(p, t);
        float h_r = waveHeight(p + vec2(eps, 0.0), t);
        float h_u = waveHeight(p + vec2(0.0, eps), t);
        
        float dh_dx = (h_r - h) / eps;
        float dh_dy = (h_u - h) / eps;
        
        float strength = 1.6;
        return normalize(vec3(-dh_dx * strength, -dh_dy * strength, 1.0));
    }

    void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        vec2 st = uv;
        st.x *= u_resolution.x / u_resolution.y;

        vec2 p = st;
        p -= vec2(0.5 * (u_resolution.x / u_resolution.y), 0.5);
        mat2 rot = mat2(0.819, -0.573, 0.573, 0.819);
        p = rot * p;
        p *= 3.8;

        // Parallax scroll displacement
        p.y += u_scroll * 0.0012;

        float t = u_time * 0.5;
        vec2 mNorm = u_mouse / u_resolution;
        mNorm.x *= u_resolution.x / u_resolution.y;

        float eps = 0.008;
        vec3 normal = getNormal(p, t, eps);

        float dispScale = u_chromatic_dispersion * 0.045;
        vec2 dispR = -normal.xy * dispScale;
        vec2 dispB = normal.xy * dispScale;

        vec3 normalR = getNormal(p + dispR, t, eps);
        vec3 normalG = normal;
        vec3 normalB = getNormal(p + dispB, t, eps);

        vec3 viewDir = vec3(0.0, 0.0, 1.0);

        vec3 lightPos = vec3(mNorm, 0.35);
        vec3 fragPos = vec3(st, 0.0);

        vec3 lightDirR = normalize(lightPos - fragPos);
        float diffR = max(dot(normalR, lightDirR), 0.0);
        vec3 halfR = normalize(lightDirR + viewDir);
        float specR = pow(max(dot(normalR, halfR), 0.0), u_roughness);

        vec3 lightDirG = normalize(lightPos - fragPos);
        float diffG = max(dot(normalG, lightDirG), 0.0);
        vec3 halfG = normalize(lightDirG + viewDir);
        float specG = pow(max(dot(normalG, halfG), 0.0), u_roughness);

        vec3 lightDirB = normalize(lightPos - fragPos);
        float diffB = max(dot(normalB, lightDirB), 0.0);
        vec3 halfB = normalize(lightDirB + viewDir);
        float specB = pow(max(dot(normalB, halfB), 0.0), u_roughness);

        float dist = length(lightPos - fragPos);
        float atten = 1.0 / (1.0 + dist * dist * 4.0);

        vec3 globLightDir = normalize(vec3(0.5, 0.8, 0.6));
        float globSpecR = pow(max(dot(normalR, normalize(globLightDir + viewDir)), 0.0), u_roughness);
        float globSpecG = pow(max(dot(normalG, normalize(globLightDir + viewDir)), 0.0), u_roughness);
        float globSpecB = pow(max(dot(normalB, normalize(globLightDir + viewDir)), 0.0), u_roughness);

        float colR = (diffR * 0.12 + specR * 1.5) * atten + globSpecR * 0.3;
        float colG = (diffG * 0.12 + specG * 1.5) * atten + globSpecG * 0.3;
        float colB = (diffB * 0.12 + specB * 1.5) * atten + globSpecB * 0.3;

        float hR = waveHeight(p + dispR, t);
        float hG = waveHeight(p, t);
        float hB = waveHeight(p + dispB, t);

        vec3 baseR = mix(u_color_dark, u_color_light, hR);
        vec3 baseG = mix(u_color_dark, u_color_light, hG);
        vec3 baseB = mix(u_color_dark, u_color_light, hB);

        vec3 finalR = baseR + u_color_specular * colR;
        vec3 finalG = baseG + u_color_specular * colG;
        vec3 finalB = baseB + u_color_specular * colB;

        vec3 finalColor = vec3(finalR.r, finalG.g, finalB.b);

        // Vignette
        float vignette = uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y);
        vignette = clamp(pow(16.0 * vignette, 0.28), 0.0, 1.0);
        finalColor *= mix(0.48, 1.0, vignette);

        gl_FragColor = vec4(finalColor, 1.0);
    }
`;

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Error compiling shader:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

export function initWebGL(canvasElement) {
    if (!canvasElement) {
        console.error('Canvas element not found.');
        return false;
    }

    gl = canvasElement.getContext('webgl') || canvasElement.getContext('experimental-webgl');
    if (!gl) {
        console.error('WebGL is not supported in this browser.');
        return false;
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return false;

    program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Error linking WebGL program:', gl.getProgramInfoLog(program));
        return false;
    }

    positionAttrLoc = gl.getAttribLocation(program, 'position');
    posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0
    ]), gl.STATIC_DRAW);

    uLoc = {
        resolution: gl.getUniformLocation(program, 'u_resolution'),
        time: gl.getUniformLocation(program, 'u_time'),
        mouse: gl.getUniformLocation(program, 'u_mouse'),
        scroll: gl.getUniformLocation(program, 'u_scroll'),
        colorDark: gl.getUniformLocation(program, 'u_color_dark'),
        colorLight: gl.getUniformLocation(program, 'u_color_light'),
        colorSpecular: gl.getUniformLocation(program, 'u_color_specular'),
        roughness: gl.getUniformLocation(program, 'u_roughness'),
        dispersion: gl.getUniformLocation(program, 'u_chromatic_dispersion'),
        frequency: gl.getUniformLocation(program, 'u_wave_frequency'),
        speed: gl.getUniformLocation(program, 'u_wave_speed'),
        shape: gl.getUniformLocation(program, 'u_shape')
    };

    return true;
}

export function updateWebGL(timeSeconds, mouseX, mouseY, scrollY, canvasWidth, canvasHeight) {
    if (!gl || !program) return;

    if (canvasElementIsResized(canvasWidth, canvasHeight)) {
        gl.viewport(0, 0, canvasWidth, canvasHeight);
    }

    gl.clearColor(0.02, 0.02, 0.03, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);
    gl.enableVertexAttribArray(positionAttrLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.vertexAttribPointer(positionAttrLoc, 2, gl.FLOAT, false, 0, 0);

    gl.uniform2f(uLoc.resolution, canvasWidth, canvasHeight);
    gl.uniform1f(uLoc.time, timeSeconds);
    gl.uniform2f(uLoc.mouse, mouseX, mouseY);
    gl.uniform1f(uLoc.scroll, scrollY);

    gl.uniform3fv(uLoc.colorDark, currentParams.colorDark);
    gl.uniform3fv(uLoc.colorLight, currentParams.colorLight);
    gl.uniform3fv(uLoc.colorSpecular, currentParams.colorSpecular);
    gl.uniform1f(uLoc.roughness, currentParams.roughness);
    gl.uniform1f(uLoc.dispersion, currentParams.dispersion);
    gl.uniform1f(uLoc.frequency, currentParams.frequency);
    gl.uniform1f(uLoc.speed, currentParams.speed);
    gl.uniform1f(uLoc.shape, currentParams.shape);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function canvasElementIsResized(width, height) {
    const canvas = gl.canvas;
    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        return true;
    }
    return false;
}
