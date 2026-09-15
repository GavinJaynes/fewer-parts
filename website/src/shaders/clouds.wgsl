import { simplex2d, simplex3d } from "@vgpu/wgsl-std/noise/simplex";

struct Params {
  resolution: vec2f,
  pointer: vec2f,
  time: f32,
  scroll: f32,
  reduced_motion: f32,
  quality: f32,
}

@group(0) @binding(0) var<uniform> params: Params;

fn hash12(position: vec2f) -> f32 {
  var sample = fract(vec3f(position.x, position.y, position.x) * 0.1031);
  sample = sample + dot(sample, sample.yzx + vec3f(33.33));
  return fract((sample.x + sample.y) * sample.z);
}

fn hash13(position: vec3f) -> f32 {
  var sample = fract(position * 0.1031);
  sample = sample + dot(sample, sample.yzx + vec3f(33.33));
  return fract((sample.x + sample.y) * sample.z);
}

fn value_noise3d(position: vec3f) -> f32 {
  let cell = floor(position);
  let local = fract(position);
  let blend = local * local * (vec3f(3.0) - 2.0 * local);
  let x00 = mix(hash13(cell), hash13(cell + vec3f(1.0, 0.0, 0.0)), blend.x);
  let x10 = mix(hash13(cell + vec3f(0.0, 1.0, 0.0)), hash13(cell + vec3f(1.0, 1.0, 0.0)), blend.x);
  let x01 = mix(hash13(cell + vec3f(0.0, 0.0, 1.0)), hash13(cell + vec3f(1.0, 0.0, 1.0)), blend.x);
  let x11 = mix(hash13(cell + vec3f(0.0, 1.0, 1.0)), hash13(cell + vec3f(1.0, 1.0, 1.0)), blend.x);
  let y0 = mix(x00, x10, blend.y);
  let y1 = mix(x01, x11, blend.y);
  return mix(y0, y1, blend.z);
}

// A broad weather field shapes the cloud banks while two billowed 3D noise
// layers carve rounded cauliflower forms into their visible surface.
fn cloud_field(position: vec3f, time: f32) -> vec4f {
  let wind = vec2f(time * 0.018, time * 0.012);
  let plane = position.xz * 0.115 + wind;
  let broad = simplex2d(plane);
  let middle = simplex2d(plane * 2.07 + vec2f(17.4, -9.1));
  let weather = broad * 0.68 + middle * 0.32;

  let domain = position * vec3f(0.82, 0.96, 0.82)
    + vec3f(time * 0.018, 11.7, time * 0.012);
  let large = value_noise3d(domain);
  let small = simplex3d(domain * 2.15 + vec3f(-19.7, 31.4, 5.6));
  let cells = smoothstep(0.28, 0.78, large);
  let lobes = (cells - 0.5) * 0.85 + small * 0.1;
  let altitude = (0.12 - position.y) * 0.32;
  let shaped_density = weather * 0.26 + lobes + altitude + 0.08;
  let cloud_deck = -position.y - 0.34;
  let density = max(shaped_density, cloud_deck);
  let lower_fade = smoothstep(-0.88, -0.58, position.y);

  return vec4f(density * lower_fade, weather, large, small);
}

fn sky_color(direction: vec3f, screen: vec2f) -> vec3f {
  let height = saturate(direction.y * 1.62 + 0.34);
  let horizon = vec3f(0.46, 0.74, 0.92);
  let zenith = vec3f(0.025, 0.31, 0.72);
  var color = mix(horizon, zenith, pow(height, 0.72));

  let sun_direction = normalize(vec3f(-0.58, 0.48, 0.66));
  let sun_amount = max(dot(direction, sun_direction), 0.0);
  color = color + vec3f(1.0, 0.78, 0.55) * pow(sun_amount, 18.0) * 0.035;

  let edge = smoothstep(1.15, 0.22, length(screen * vec2f(0.72, 0.92)));
  return mix(color * 0.94, color, edge);
}

@fragment
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let safe_height = max(params.resolution.y, 1.0);
  let aspect = params.resolution.x / safe_height;
  let screen = vec2f((uv.x - 0.5) * aspect, 0.5 - uv.y);

  let motion = 1.0 - params.reduced_motion;
  let scene_time = params.time * motion;
  let camera_origin = vec3f(
    params.pointer.x * 0.065 * motion,
    1.62 + params.scroll * 0.08,
    params.time * 0.032 * motion + params.scroll * 0.72,
  );
  let forward = normalize(vec3f(
    params.pointer.x * 0.052 * motion,
    -0.02 + params.pointer.y * 0.028 * motion - params.scroll * 0.038,
    1.0,
  ));
  let right = normalize(cross(forward, vec3f(0.0, 1.0, 0.0)));
  let up = normalize(cross(right, forward));
  let direction = normalize(forward * 1.48 + right * screen.x + up * screen.y);
  let sky = sky_color(direction, screen);

  var color = sky;

  if (direction.y < -0.004) {
    let cloud_ceiling = 1.16;
    let cloud_floor = -0.78;
    let start = max((cloud_ceiling - camera_origin.y) / direction.y, 0.0);
    let finish = min((cloud_floor - camera_origin.y) / direction.y, 42.0);
    let span = max(finish - start, 0.001);
    let sun_direction = normalize(vec3f(-0.46, 0.78, -0.32));
    let cloud_shadow = vec3f(0.11, 0.3, 0.52);
    let cloud_white = vec3f(1.03, 1.02, 0.99);
    let pixel = floor(uv * params.resolution);
    let jitter = hash12(pixel);
    var first_distance = finish;
    var transmittance = 1.0;
    var radiance = vec3f(0.0);
    var has_cloud = false;

    for (var step = 0; step < 72; step = step + 1) {
      let sample_index = f32(step) + jitter * 0.32;
      let march_t = sample_index / 72.0;
      let next_t = min((sample_index + 1.0) / 72.0, 1.0);
      let distance_travelled = start + span * march_t * march_t;
      let sample_length = max(span * (next_t * next_t - march_t * march_t), 0.001);
      let position = camera_origin + direction * distance_travelled;
      let sample = cloud_field(position, scene_time);
      let density = saturate(sample.x * 2.25);
      if (density > 0.002) {
        if (!has_cloud) {
          first_distance = distance_travelled;
          has_cloud = true;
        }

        let light_density = max(cloud_field(position + sun_direction * 0.42, scene_time).x, 0.0);
        let sun_transmittance = exp(-light_density * 5.2);
        let height_light = saturate((position.y + 0.62) / 1.72);
        let lighting = saturate(0.2 + sun_transmittance * 0.6 + height_light * 0.2);
        var sample_color = mix(cloud_shadow, cloud_white, pow(lighting, 0.9));
        sample_color = sample_color * (0.99 + sample.w * 0.035);
        let forward_scatter = pow(max(dot(direction, sun_direction), 0.0), 12.0);
        sample_color = sample_color + vec3f(1.0, 0.88, 0.68) * forward_scatter * 0.09;

        let extinction = 1.0 - exp(-density * sample_length * 2.75);
        let contribution = transmittance * extinction;
        radiance = radiance + sample_color * contribution;
        transmittance = transmittance * (1.0 - extinction);

        if (transmittance < 0.018) {
          break;
        }
      }

    }

    if (has_cloud) {
      let cloud_alpha = 1.0 - transmittance;
      var cloud_color = radiance / max(cloud_alpha, 0.001);
      let distance_haze = 1.0 - exp(-first_distance * 0.052);
      cloud_color = mix(cloud_color, vec3f(0.62, 0.79, 0.92), distance_haze * 0.62);
      let horizon_visibility = smoothstep(-0.004, -0.05, direction.y);
      color = mix(sky, cloud_color, cloud_alpha * horizon_visibility);
    }
  }

  color = pow(color, vec3f(0.92));

  return vec4f(saturate(color), 1.0);
}
