// src/pages/formularios_dash/TecnicasForm.jsx
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

/* ── Tokens de color (mismos que AgregarProducto) ── */
const C = {
  navy: "#1a2540",
  navyGrad: "linear-gradient(90deg, #1a2540 0%, #2d3f6e 100%)",
  accent: "#4f8ef7",
  accentSoft: "#f0f4ff",
  accentBorder: "#c7d9ff",
  success: "#16a34a",
  warning: "#d97706",
  danger: "#dc2626",
  muted: "#64748b",
  border: "#e2e8f0",
  bg: "#f8fafc",
};

const TecnicasForm = ({ onClose, onSave, tecnicaEdit = null, tecnicasExistentes = [] }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    imagenTecnica: "",
    estado: true,
  });

  const [errors, setErrors] = useState({ nombre: "", descripcion: "", imagenTecnica: "" });
  const [touched, setTouched] = useState({ nombre: false, descripcion: false, imagenTecnica: false });
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    if (tecnicaEdit) {
      setFormData({
        nombre: tecnicaEdit.Nombre || "",
        descripcion: tecnicaEdit.Descripcion || "",
        imagenTecnica: tecnicaEdit.imagenTecnica || "",
        estado: tecnicaEdit.Estado !== undefined ? tecnicaEdit.Estado : true,
      });
    }
  }, [tecnicaEdit]);

  const validarNombre = (valor) => {
    const trimmed = valor.trim();
    if (!trimmed) return "El nombre es obligatorio.";
    if (trimmed.length < 4) return "El nombre debe tener al menos 4 caracteres.";
    if (trimmed.length > 40) return "El nombre no puede superar 40 caracteres.";
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.,]+$/.test(trimmed)) return "El nombre solo puede contener letras, espacios, puntos y comas.";
    if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(trimmed)) return "El nombre debe contener al menos una letra.";
    const nombreDuplicado = tecnicasExistentes.some(
      (t) => t.Nombre.toLowerCase().trim() === trimmed.toLowerCase() && t.TecnicaID !== tecnicaEdit?.TecnicaID
    );
    if (nombreDuplicado) return "Ya existe una técnica con este nombre.";
    return "";
  };

  const validarDescripcion = (valor) => {
    if (!valor.trim()) return "La descripción es obligatoria.";
    if (valor.trim().length < 10) return "La descripción debe tener al menos 10 caracteres.";
    if (valor.trim().length > 200) return "La descripción no puede superar 200 caracteres.";
    return "";
  };

  const validarImagen = (valor) => {
    const trimmed = valor.trim();
    if (!trimmed) return "La imagen es obligatoria.";
    const isBase64 = /^data:image\/(jpeg|jpg|png|gif|webp|svg\+xml);base64,/.test(trimmed);
    const isURL = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i.test(trimmed);
    const isLocalPath = /^[a-zA-Z0-9_\-/.]+\.(jpg|jpeg|png|gif|webp|svg)$/i.test(trimmed);
    if (!isBase64 && !isURL && !isLocalPath) return "Debe ser una imagen Base64, URL válida o ruta de archivo.";
    if (isBase64 && trimmed.length > 7000000) return "La imagen es demasiado grande. Máximo 5MB.";
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === "estado" ? value === "true" : value }));
    if (name === "imagenTecnica") setPreviewError(false);
    if (touched[name]) validateField(name, value);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, imagenTecnica: "Solo se permiten imágenes (JPG, PNG, GIF, WEBP, SVG)" }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, imagenTecnica: "La imagen no puede superar 5MB" }));
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, imagenTecnica: reader.result }));
      setTouched(prev => ({ ...prev, imagenTecnica: true }));
      validateField("imagenTecnica", reader.result);
      setPreviewError(false);
    };
    reader.onerror = () => setErrors(prev => ({ ...prev, imagenTecnica: "Error al cargar la imagen" }));
    reader.readAsDataURL(file);
  };

  const validateField = (fieldName, value) => {
    let error = "";
    switch (fieldName) {
      case "nombre": error = validarNombre(value); break;
      case "descripcion": error = validarDescripcion(value); break;
      case "imagenTecnica": error = validarImagen(value); break;
      default: break;
    }
    setErrors((prev) => ({ ...prev, [fieldName]: error }));
    return error;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const validateForm = () => {
    const nombreError = validarNombre(formData.nombre);
    const descripcionError = validarDescripcion(formData.descripcion);
    const imagenError = validarImagen(formData.imagenTecnica);
    setErrors({ nombre: nombreError, descripcion: descripcionError, imagenTecnica: imagenError });
    setTouched({ nombre: true, descripcion: true, imagenTecnica: true });
    return !nombreError && !descripcionError && !imagenError;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSave({
      Nombre: formData.nombre.trim(),
      Descripcion: formData.descripcion.trim(),
      imagenTecnica: formData.imagenTecnica.trim(),
      Estado: formData.estado,
    });
  };

  const shouldShowPreview = formData.imagenTecnica && !errors.imagenTecnica && !previewError;

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');`}</style>

      <div className="container py-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
        <div className="position-relative mb-4 text-center">
          <p className="fw-bold fs-3 mb-0" style={{ color: C.navy }}>
            {tecnicaEdit ? "Editar Técnica" : "Crear Técnica"}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm shadow-sm position-absolute top-0 end-0"
            style={{ background: C.danger, color: "#fff", border: "none" }}
            title="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="p-4 rounded shadow" style={{ backgroundColor: C.bg }}>
          <div className="row g-3">

            {/* NOMBRE */}
            <div className="col-md-12">
              <label className="form-label fw-bold" style={{ color: C.navy }}>
                Nombre de la Técnica <span style={{ color: C.danger }}>*</span>
              </label>
              <input
                type="text"
                className={`form-control ${touched.nombre && errors.nombre ? "is-invalid" : ""}`}
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Ej: Serigrafía, Bordado..."
                maxLength={40}
              />
              {touched.nombre && errors.nombre && (
                <div className="invalid-feedback d-block">{errors.nombre}</div>
              )}
            </div>

            {/* DESCRIPCIÓN */}
            <div className="col-md-12">
              <label className="form-label fw-bold" style={{ color: C.navy }}>
                Descripción <span style={{ color: C.danger }}>*</span>
              </label>
              <textarea
                className={`form-control ${touched.descripcion && errors.descripcion ? "is-invalid" : ""}`}
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Describa la técnica de estampado (mínimo 10 caracteres)"
                rows="4"
                maxLength={200}
              />
              {touched.descripcion && errors.descripcion && (
                <div className="invalid-feedback d-block">{errors.descripcion}</div>
              )}
            </div>

            {/* IMAGEN - SUBIR ARCHIVO */}
            <div className="col-md-12">
              <label className="form-label fw-bold" style={{ color: C.navy }}>
                Cargar Imagen <span style={{ color: C.danger }}>*</span>
              </label>
              <input
                type="file"
                className="form-control"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
                onChange={handleFileChange}
              />
              <small style={{ color: C.muted }} className="d-block mt-2 ms-1">
                Formatos: JPG, PNG, GIF, WEBP, SVG. Tamaño máximo: 5MB
              </small>
            </div>

            <div className="col-md-12">
              {touched.imagenTecnica && errors.imagenTecnica && (
                <div className="invalid-feedback d-block">{errors.imagenTecnica}</div>
              )}
            </div>

            {/* PREVIEW DE IMAGEN */}
            {shouldShowPreview && (
              <div className="col-md-12">
                <div className="card" style={{ border: `1.5px solid ${C.accentBorder}` }}>
                  <div className="card-header text-white" style={{ background: C.navyGrad }}>
                    <small>Vista Previa</small>
                  </div>
                  <div className="card-body text-center">
                    <img
                      src={formData.imagenTecnica}
                      alt="Preview"
                      className="img-fluid rounded shadow-sm"
                      style={{ maxHeight: "250px", objectFit: "contain" }}
                      onError={() => {
                        setPreviewError(true);
                        setErrors(prev => ({ ...prev, imagenTecnica: "No se pudo cargar la imagen. Verifica el formato." }));
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ESTADO */}
            <div className="col-md-6">
              <label className="form-label fw-bold" style={{ color: C.navy }}>Estado</label>
              <select
                className="form-select"
                name="estado"
                value={formData.estado.toString()}
                onChange={handleChange}
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>

          {/* BOTONES */}
          <div className="d-flex justify-content-center gap-3 mt-4">
            <button
              type="button"
              className="btn px-4"
              onClick={handleSubmit}
              style={{ background: C.navy, color: "#fff", border: "none", fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}
            >
              {tecnicaEdit ? "Actualizar Técnica" : "Crear Técnica"}
            </button>
            <button
              type="button"
              className="btn px-4"
              onClick={onClose}
              style={{ background: "#f1f5f9", color: C.muted, border: "none", fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TecnicasForm;