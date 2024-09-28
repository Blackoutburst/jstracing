export const vertexShader2D =
    `#version 300 es

layout (location = 0) in vec2 aPos;

void main() {
    gl_Position = vec4(aPos, 0.0, 1.0);
}
`

export const fragmentShader2D =
`#version 300 es
precision highp float;

#define S32_MAX 2147483647.0
#define RENDER_PASS 200
#define BOUNCE_COUNT 20
#define DIVERGENCE 5.0

uniform vec2 resolution;
uniform float time;

uniform sampler2D MainTexOld;

out vec4 FragColor;

struct Ray {
    vec3 origin;
    vec3 dir;
};

struct RayTracingMaterial {
    vec4 color;
    vec4 emissionColor;
    float emissionStrength;
    float smoothness;
    float specularProbability;
    vec4 specularColor;
};

struct HitInfo {
    bool didHit;
    float dst;
    vec3 hitPoint;
    vec3 normal;
    RayTracingMaterial material;
};

struct Sphere {
    vec3 position;
    float radius;
    RayTracingMaterial material;
};

int NumSpheres = 7;
const Sphere Spheres[7] = Sphere[7](
    Sphere(vec3(-2.0, 0.1, -4.0), 1.0, RayTracingMaterial(vec4(1.0, 0.5, 0.0, 1.0), vec4(0.0), 0.0, 1.0, 0.5, vec4(1.0))),
    Sphere(vec3(2.0, 0.1, -4.0), 1.0, RayTracingMaterial(vec4(0.0, 0.5, 1.0, 1.0), vec4(0.0), 0.0, 1.0, 0.1, vec4(1.0))),
    Sphere(vec3(0.0, 1.0, -5.0), 1.0, RayTracingMaterial(vec4(1.0), vec4(0.0), 0.0, 0.5, 1.0, vec4(1.0))),
    Sphere(vec3(0.0, -1.1, -3.0), 0.5, RayTracingMaterial(vec4(1.0), vec4(0.0, 1.0, 0.0, 1.0), 0.0, 1.0, 1.0, vec4(1.0))),
    Sphere(vec3(0.0, -20.0, -20.0), 25.0, RayTracingMaterial(vec4(1.0, 0.4, 1.0, 1.0), vec4(0.0), 0.0, 1.0, 0.8, vec4(1.0))),
    Sphere(vec3(0.0, 80.0, -30.0), 25.0, RayTracingMaterial(vec4(0.0), vec4(1.0), 10.0, 1.0, 0.0, vec4(1.0))),
    Sphere(vec3(0.0, 30.0, 30.0), 25.0, RayTracingMaterial(vec4(0.0), vec4(1.0), 1.0, 1.0, 0.0, vec4(1.0)))
);

HitInfo RaySphere(Ray ray, vec3 sphereCenter, float sphereRadius) {
    HitInfo hitInfo = HitInfo(false, 0.0, vec3(0.0), vec3(0.0), RayTracingMaterial(vec4(0.0), vec4(0.0), 0.0, 0.0, 0.0, vec4(1.0)));
    vec3 offsetRayOrigin = ray.origin - sphereCenter;

    float a = dot(ray.dir, ray.dir);
    float b = 2.0 * dot(offsetRayOrigin, ray.dir);
    float c = dot(offsetRayOrigin, offsetRayOrigin) - sphereRadius * sphereRadius;

    float discriminant = b * b - 4.0 * a * c;

    if (discriminant >= 0.0) {
        float dst = (-b - sqrt(discriminant)) / (2.0 * a);

        if (dst >= 0.0) {
            hitInfo.didHit = true;
            hitInfo.dst = dst;
            hitInfo.hitPoint = ray.origin + ray.dir * dst;
            hitInfo.normal = normalize(hitInfo.hitPoint - sphereCenter);
        }
    }

    return hitInfo;
}

HitInfo CalculateRayCollision(Ray ray) {
    HitInfo closestHit = HitInfo(false, 0.0, vec3(0.0), vec3(0.0), RayTracingMaterial(vec4(0.0), vec4(0.0), 0.0, 0.0, 0.0, vec4(1.0)));
    closestHit.dst = S32_MAX;

    for (int i = 0; i < NumSpheres; i++) {
        Sphere sphere = Spheres[i];
        HitInfo hitInfo = RaySphere(ray, sphere.position, sphere.radius);

        if (hitInfo.didHit && hitInfo.dst < closestHit.dst) {
            closestHit = hitInfo;
            closestHit.material = sphere.material;
        }
    }

    return closestHit;
}

float RandomValue(inout uint state) {
    state = state * 747796405u + 2891336453u;
    uint word = ((state >> ((state >> 28u) + 4u)) ^ state) * 277803737u;
    word = (word >> 22u) ^ word;
    return float(word) / 4294967295.0;
}

float RandomValueNormalDistribution(inout uint state) {
    float theta = 2.0 * 3.1415926 * RandomValue(state);
    float rho = sqrt(-2.0 * log(RandomValue(state)));
    return rho * cos(theta);
}

vec3 RandomDirection(inout uint state) {
    float x = RandomValueNormalDistribution(state);
    float y = RandomValueNormalDistribution(state);
    float z = RandomValueNormalDistribution(state);

    return normalize(vec3(x, y, z));
}

vec3 Trace(Ray ray, inout uint state) {
    vec4 incomingLight = vec4(0.1);
    vec4 rayColor = vec4(1.0);
    for (int i = 0; i <= BOUNCE_COUNT; i++) {
        HitInfo hitInfo = CalculateRayCollision(ray);
        RayTracingMaterial material = hitInfo.material;

        if (hitInfo.didHit) {
            ray.origin = hitInfo.hitPoint;
            vec3 diffuseDir = normalize(hitInfo.normal + RandomDirection(state));
            vec3 specularDir = reflect(ray.dir, hitInfo.normal);
            bool isSpecularBounce = material.specularProbability >= RandomValue(state);
            ray.dir = vec3(mix(diffuseDir, specularDir, material.smoothness * float(isSpecularBounce)));

            vec3 emittedLight = material.emissionColor.rgb * material.emissionStrength;
            incomingLight += vec4(emittedLight, 0.0) * rayColor;
            rayColor *= vec4(vec3(mix(material.color, material.specularColor, float(isSpecularBounce))), 1.0);
        } else {
            break;
        }
    }

    return incomingLight.xyz;
}

vec2 RandomPointInCircle(inout uint state) {
    float angle = RandomValue(state) * 2.0 * 3.1415926;
    vec2 pointOnCircle = vec2(cos(angle), sin(angle));
    return pointOnCircle * sqrt(RandomValue(state));
}

void main() {
    vec2 ndc = (gl_FragCoord.xy / resolution) * 2.0 - 1.0;
    ndc.x *= resolution.x / resolution.y;

    vec2 numPixels = resolution.xy;
    vec2 pixelCoords = gl_FragCoord.xy * numPixels;
    float pixelIndex = pixelCoords.y * numPixels.x + pixelCoords.x;

    uint rngState = uint(pixelIndex + time * 719393.0);

    float fov = radians(90.0);
    float focalLength = 1.0 / tan(fov / 2.0);

    vec3 viewPoint = vec3(ndc.x, ndc.y, -focalLength);
    vec3 rayOrigin = vec3(0.0, 0.0, 0.0);
    vec2 jitter = RandomPointInCircle(rngState) * DIVERGENCE / numPixels.x;
    vec3 jitteredView = viewPoint + vec3(1.0, 0.0, 0.0) * vec3(jitter.x) + vec3(0.0, 1.0, 0.0) * vec3(jitter.y);
    vec3 rayDir = normalize(jitteredView - rayOrigin);

    Ray ray = Ray(rayOrigin, rayDir);

    vec2 uv = gl_FragCoord.xy / resolution;

    vec4 oldRender = texture(MainTexOld, uv);
    vec4 newRender = vec4(Trace(ray, rngState), 1.0);
    float weight = 1.0 / (time + 1.0);

    vec4 accumulatedAverage = oldRender * (1.0 - weight) + newRender * weight;

    FragColor = vec4(accumulatedAverage.xyz, 1.0);
}
`
