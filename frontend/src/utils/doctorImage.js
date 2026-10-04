const DUMMY_IMAGES = ['/doctors/doctor-1.jpg', '/doctors/doctor-2.jpg', '/doctors/doctor-3.jpg', '/doctors/doctor-4.jpg'];

function hash(value) {
  let result = 0;
  for (const char of String(value || '')) result = (result * 31 + char.charCodeAt(0)) >>> 0;
  return result;
}

export function doctorImage(doctor) {
  return DUMMY_IMAGES[hash(doctor?._id || doctor?.email || doctor?.name) % DUMMY_IMAGES.length];
}

export function fallbackToDummy(doctor) {
  return (event) => {
    const fallback = doctorImage(doctor);
    if (!event.currentTarget.src.endsWith(fallback)) event.currentTarget.src = fallback;
  };
}
