export const changeName = (name: String): String => {
  const lastDotIndex = name.lastIndexOf(".");
  const nombreSinExtension = name.slice(0, lastDotIndex);
  const extension = name.slice(lastDotIndex + 1);

  const limpio = nombreSinExtension
    .toLowerCase()
    .replace(/\s+/g, "_")         // reemplaza espacios por _
    .replace(/[^a-z0-9_-]/g, ""); // elimina caracteres no permitidos

  return `${limpio}.${extension}`;
};
