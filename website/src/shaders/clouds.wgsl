import { simplex2d, simplex3d } from "@vgpu/wgsl-std/noise/simplex";

struct Params {
  resolution: vec2f,
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

// The sun has just dropped under the horizon, slightly left of the flight path,
// so it grazes the cloud tops instead of lighting them from above.
const SUN_DIRECTION = vec3f(-0.4118, 0.0784, 0.9078);

// Billowed fractal noise. Folding simplex about zero gives the rounded
// cauliflower lobes cumulus are made of; plain fractal noise gives hills.
// Each octave is offset as well as scaled so nothing lines up on an axis.
//
// `detail` fades the high octaves out where the march is too coarse to resolve
// them — far from the camera, and on the shadow sample. Fading them rather than
// dropping them, and normalising by the weight actually used, keeps the average
// erosion constant: cut an octave outright and distant cloud snaps back to the
// bare extruded footprint, which reads as a row of boxes on the horizon.
fn billow_fbm(point: vec3f, detail: f32) -> f32 {
  var value = 0.0;
  var amplitude = 0.5;
  var total = 0.0;
  var sample_point = point;

  for (var octave = 0; octave < 3; octave = octave + 1) {
    let weight = saturate(detail * 3.0 - f32(octave) + 1.0);
    if (weight <= 0.0) {
      break;
    }

    value = value + amplitude * weight * (1.0 - abs(simplex3d(sample_point)));
    total = total + amplitude * weight;
    sample_point = sample_point * 2.17 + vec3f(19.1, -7.3, 4.7);
    amplitude = amplitude * 0.34;
  }

  return value / max(total, 0.001);
}

// The cheap half of the field, and the only part most samples need. A 2D weather
// plane decides how much of each column is cloud and how tall it grows; the
// result is an extruded footprint that cloud_density then erodes.
//
// Returns (footprint, normalised height in the column, undercast density).
fn cloud_shape(position: vec3f, time: f32) -> vec3f {
  let wind = vec2f(time * 0.02, time * 0.013);
  let plane = position.xz * 0.19 + wind;

  // Warping the plane before sampling it stops the footprints from sitting on
  // the noise lattice and gives them a wind-blown drift instead. One sample
  // driving both axes is enough at this frequency, and saves a noise fetch on
  // every step of every march.
  let warp = simplex2d(plane * 0.55 + vec2f(4.3, -1.8));
  let warped = plane + vec2f(warp * 0.55, warp * -0.38);

  let broad = simplex2d(warped);
  let middle = simplex2d(warped * 2.31 + vec2f(17.4, -9.1));
  let weather = broad * 0.66 + middle * 0.34;
  let coverage = smoothstep(-0.06, 0.46, weather);

  // Height rides the finer octave so the tallest towers are not simply the ones
  // with the widest footprint.
  let lift = middle * 0.5 + 0.5;
  let base = -0.6;
  // The floor on `top` matters more than it looks. Letting it fall all the way
  // to the base means that wherever coverage tails off, the column collapses to
  // a sliver and `height` sweeps nought to one across a couple of centimetres of
  // world space — so `profile` turns into a paper-thin sheet ringing every cloud.
  // That rim of shards was the grain on the tops, and because it is real
  // geometry rather than a sampling artifact, no march resolution touched it.
  // Keep the column a sane height and let coverage alone fade the cloud out.
  let top = mix(0.02, 0.92, pow(coverage, 1.2) * mix(0.5, 1.0, lift));
  let height = saturate((position.y - base) / max(top - base, 0.001));
  let profile = smoothstep(0.0, 0.2, height) * smoothstep(1.0, 0.62, height);

  // A broken undercast well below the cumulus stops the distance going hollow
  // where the individual clouds get too small to resolve, without sealing the
  // gaps that let the dark air show through close to the camera.
  let undercast = 0.34
    * smoothstep(0.0, 0.34, -position.y - 0.78 + weather * 0.07);

  return vec3f(coverage * profile, height, undercast);
}

// Erode the extruded footprint with billowed noise, harder near the top. Without
// this the field is a straight extrusion of the 2D plane and the clouds come out
// as boxes, so the erosion does most of the visible work — but it is also the
// expensive half, so it only runs where there is a footprint to erode.
fn cloud_density(position: vec3f, time: f32, detail_level: f32) -> f32 {
  let shape = cloud_shape(position, time);
  var density = shape.z;

  if (shape.x > 0.001) {
    let domain = position * vec3f(1.25, 1.05, 1.25)
      + vec3f(time * 0.02, 11.7, time * 0.013);
    let erosion = billow_fbm(domain, detail_level) * mix(0.32, 0.44, shape.y);
    // Remapping the footprint against the erosion — rather than subtracting it —
    // keeps the cores solid while the silhouette frays into wisps.
    density = max(density, (shape.x - erosion) / max(1.0 - erosion, 0.05));
  }

  return max(density, 0.0) * smoothstep(-1.02, -0.9, position.y);
}

// Shadowing only needs to know roughly how much cloud is in the way, not what
// shape its lobes are, so the light probe skips the erosion entirely. That makes
// it several times cheaper than a full density evaluation and, just as usefully,
// smoother: the erosion is what made neighbouring probes disagree sharply around
// a cloud's rim. The 0.72 stands in for the volume the erosion would have
// removed.
fn cloud_occlusion(position: vec3f, time: f32) -> f32 {
  let shape = cloud_shape(position, time);
  return max(shape.x * 0.72, shape.z) * smoothstep(-1.02, -0.9, position.y);
}

// Blue hour reads as a periwinkle zenith falling through dusty mauve to a narrow
// warm band the sun leaves sitting right on the horizon. These are pre-tonemap
// values, so they run past 1.0 where the band and the upper sky need to survive
// the exposure curve at the bottom of fs_main.
//
// The camera only sees roughly -0.30 to +0.20 of direction.y, so every stop is
// packed into that range: spread them any wider and the band swallows the frame.
fn sky_color(direction: vec3f) -> vec3f {
  let height = direction.y;

  let zenith = vec3f(0.5, 0.63, 1.18);
  let upper = vec3f(0.7, 0.79, 1.28);
  let middle = vec3f(1.16, 0.89, 1.06);
  let band = vec3f(1.78, 1.01, 0.98);
  let under = vec3f(0.66, 0.82, 1.3);

  var color = mix(under, band, smoothstep(-0.055, 0.001, height));
  color = mix(color, middle, smoothstep(0.004, 0.035, height));
  color = mix(color, upper, smoothstep(0.025, 0.1, height));
  color = mix(color, zenith, smoothstep(0.09, 0.21, height));

  let sun_amount = max(dot(direction, SUN_DIRECTION), 0.0);
  color = color + vec3f(1.0, 0.6, 0.47) * pow(sun_amount, 9.0) * 0.3;
  color = color + vec3f(1.0, 0.74, 0.62) * pow(sun_amount, 46.0) * 0.45;

  return color;
}

@fragment
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let safe_height = max(params.resolution.y, 1.0);
  let aspect = params.resolution.x / safe_height;
  let screen = vec2f((uv.x - 0.5) * aspect, 0.5 - uv.y);
  let pixel = floor(uv * params.resolution);

  let motion = 1.0 - params.reduced_motion;
  // High enough above the deck that the cumulus read as a carpet running to the
  // horizon rather than as banks passing at eye level. The weather plane puts a
  // cloud at roughly five world units across, so the glide rate is really a
  // choice about how long one takes to pass: this is a little over half a minute.
  let scene_time = params.time * motion;
  let camera_origin = vec3f(
    0.0,
    2.55 + params.scroll * 0.12,
    params.time * 0.14 * motion + params.scroll * 0.9,
  );
  // Looking a little below level puts the horizon around a third down the frame
  // and leaves the receding cloud carpet filling everything under it.
  let forward = normalize(vec3f(0.0, -0.095 - params.scroll * 0.038, 1.0));
  let right = normalize(cross(forward, vec3f(0.0, 1.0, 0.0)));
  let up = normalize(cross(right, forward));
  let direction = normalize(forward * 1.62 + right * screen.x + up * screen.y);
  let sky = sky_color(direction);

  var color = sky;

  if (direction.y < -0.004) {
    let cloud_ceiling = 1.05;
    let cloud_floor = -1.02;
    let start = max((cloud_ceiling - camera_origin.y) / direction.y, 0.0);
    let finish = min((cloud_floor - camera_origin.y) / direction.y, 55.0);
    let span = max(finish - start, 0.001);
    let max_iterations = i32(mix(48.0, 92.0, params.quality));
    let fine_base = mix(0.075, 0.03, params.quality);
    // Coarse strides cross the empty air between banks; the fine step is what
    // actually integrates a cloud, and it grows with distance because the pixel
    // footprint and the detail LOD both coarsen out there anyway.
    let coarse_step = max(span / 34.0, 0.1);
    let jitter = hash12(pixel);
    var travelled = start + jitter * coarse_step;
    var transmittance = 1.0;
    var radiance = vec3f(0.0);
    var first_distance = finish;
    var has_cloud = false;
    var is_fine = false;
    var empty_run = 0;

    for (var iteration = 0; iteration < max_iterations; iteration = iteration + 1) {
      if (travelled >= finish) {
        break;
      }

      // Three speeds, not two. Fine steps are only worth their cost at the
      // visible surface of a bank: once enough opacity has accumulated that the
      // interior cannot be seen, stepping finely through it buys nothing. Most
      // rays need only a handful of fine samples before transmittance falls far
      // enough to coarsen, which is what keeps this affordable.
      let surface_step = clamp(fine_base + travelled * 0.012, fine_base, coarse_step);
      let inside_step = select(surface_step * 3.2, surface_step, transmittance > 0.55);
      let step = select(coarse_step, inside_step, is_fine);
      let position = camera_origin + direction * travelled;
      // Fade the octaves this step cannot resolve, and the ones too small on
      // screen to be worth resolving.
      let detail_level = clamp(
        min(0.07 / step, 1.0 - (travelled - 3.0) / 18.0),
        0.25,
        1.0,
      );
      let raw = cloud_density(position, scene_time, detail_level);

      if (raw <= 0.002) {
        // A few empty fine steps in a row mean the bank has really ended rather
        // than that we are crossing a gap inside it, so go back to striding.
        empty_run = empty_run + 1;
        if (empty_run > 3) {
          is_fine = false;
        }

        travelled = travelled + step;
        continue;
      }

      empty_run = 0;

      if (!is_fine) {
        // A coarse stride landed inside a bank. Back up and come in again at the
        // fine step: entering on a stride is what sliced the cloud tops into
        // terraces, which the per-pixel jitter then turned into crust.
        is_fine = true;
        travelled = max(travelled - coarse_step, start);
        continue;
      }

      if (!has_cloud) {
        first_distance = travelled;
        has_cloud = true;
      }

      let density = smoothstep(0.0, 0.5, raw);

      // A grazing sun throws long shadows, so the single light sample is taken
      // well along the sun direction: it is the deep flank under a tower that
      // sells the hour, not the fine self-shadowing.
      // Two samples, not one. A single shadow probe turns the small density
      // difference between a wisp at a cloud's rim and the body behind it into a
      // large brightness difference, and that contrast is most of what the eye
      // reads as grain on the tops. Averaging two decorrelated probes halves
      // that variance; summing their occlusion keeps the long deep flank under a
      // tower, which is where the form comes from. Simply weakening the shadow
      // instead removes the grain and the form together.
      let shadow_near = cloud_occlusion(position + SUN_DIRECTION * 0.45, scene_time);
      let shadow_far = cloud_occlusion(position + SUN_DIRECTION * 1.15, scene_time);
      let sun_transmittance = exp(-(shadow_near * 2.6 + shadow_far * 2.2));
      let height_light = saturate((position.y + 0.62) / 1.5);

      // Ambient is the sky itself: deep indigo in the crevices, periwinkle where
      // a top faces up into what is left of the light.
      let ambient = mix(
        vec3f(0.098, 0.172, 0.404),
        vec3f(0.46, 0.58, 1.03),
        pow(height_light, 1.55),
      );
      // Powder. A thin wisp scatters far less light back at the viewer than a
      // dense core does. Without this, the specks the erosion leaves around a
      // silhouette each get full sun — nothing is above them to cast shade — and
      // they spark against the self-shadowed body behind them. That contrast, not
      // the specks themselves, is what reads as grain on the cloud tops, and no
      // amount of march resolution touches it.
      let powder = 1.0 - exp(-raw * 9.0);

      // What is left of the sun is only just warm; the tops read cool white.
      let direct = vec3f(1.0, 0.93, 0.95)
        * 1.95
        * sun_transmittance
        * powder
        * (0.06 + height_light * 0.95);
      var sample_color = ambient + direct;

      // Silver and pink rims where we look back toward the buried sun.
      let forward_scatter = pow(max(dot(direction, SUN_DIRECTION), 0.0), 9.0);
      sample_color = sample_color
        + vec3f(1.0, 0.5, 0.4) * forward_scatter * sun_transmittance * 0.55;

      let extinction = 1.0 - exp(-density * step * 3.8);
      radiance = radiance + sample_color * transmittance * extinction;
      transmittance = transmittance * (1.0 - extinction);

      if (transmittance < 0.02) {
        break;
      }

      travelled = travelled + step;
    }

    if (has_cloud) {
      let cloud_alpha = 1.0 - transmittance;
      var cloud_color = radiance / max(cloud_alpha, 0.001);
      // Aerial perspective, on a curve that stays out of the way close up and
      // then climbs hard. Past twenty-odd units a grazing ray is looking through
      // so much cloudy air that the deck really is unbroken haze — which is also
      // exactly where the march stops resolving one bank from the next, so the
      // honest reading and the stable one are the same picture.
      let distance_haze = smoothstep(6.0, 34.0, first_distance);
      cloud_color = mix(cloud_color, vec3f(0.78, 0.9, 1.34), distance_haze * 0.85);
      let horizon_visibility = smoothstep(-0.004, -0.05, direction.y);
      color = mix(sky, cloud_color, cloud_alpha * horizon_visibility);
    }
  }

  // Exposure with a soft highlight rolloff, then a little extra contrast so the
  // deck keeps the depth it has at dusk.
  color = vec3f(1.0) - exp(-color * 1.18);
  color = pow(color, vec3f(1.12));

  let vignette = 1.0 - smoothstep(0.58, 1.34, length(screen * vec2f(0.86, 1.18))) * 0.2;
  color = color * vignette;

  // Sensor grain. Quantising time keeps it flickering at a filmic rate rather
  // than once per rendered frame.
  let grain_time = floor(params.time * 12.0) * 37.0;
  let grain = hash12(pixel + vec2f(grain_time, grain_time * 1.7)) - 0.5;
  color = color + vec3f(grain) * 0.014;

  return vec4f(saturate(color), 1.0);
}
