const { Insumo, Producto, DetalleCompra } = require('../models');

// Obtener todos los insumos
exports.getAllInsumos = async (req, res) => {
    try {
        const insumos = await Insumo.findAll();
        res.json(insumos);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener insumos',
            error: error.message
        });
    }
};

// Obtener un insumo por ID
exports.getInsumoById = async (req, res) => {
    try {
        const insumo = await Insumo.findByPk(req.params.id, {
            include: [
                {
                    model: Producto,
                    as: 'productos',
                    through: { attributes: [] }
                }
            ]
        });

        if (!insumo) {
            return res.status(404).json({ message: 'Insumo no encontrado' });
        }

        res.json(insumo);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener insumo',
            error: error.message
        });
    }
};

// Crear un nuevo insumo
exports.createInsumo = async (req, res) => {
  try {
    const { Nombre, Stock, Estado, Tipo, PrecioTela } = req.body;

    // validaciones básicas
    if (!Nombre || !Nombre.toString().trim()) {
      return res.status(400).json({ message: 'El Nombre es obligatorio.' });
    }

    if (!Tipo || !Tipo.toString().trim()) {
      return res.status(400).json({ message: 'El Tipo de insumo es obligatorio.' });
    }

    // Si es tela, PrecioTela es obligatorio y debe ser número >= 0
    if (String(Tipo).toLowerCase() === 'tela') {
      if (PrecioTela === undefined || PrecioTela === null || PrecioTela === '') {
        return res.status(400).json({ message: 'PrecioTela es obligatorio cuando Tipo es "Tela".' });
      }
      const p = parseFloat(PrecioTela);
      if (Number.isNaN(p) || p < 0) {
        return res.status(400).json({ message: 'PrecioTela debe ser un número >= 0.' });
      }
    }

    // Preprocesar precio si viene
    let precioTelaProcessed = undefined;
    if (PrecioTela !== undefined && PrecioTela !== null && PrecioTela !== '') {
      precioTelaProcessed = parseFloat(PrecioTela);
    }

    const nuevoInsumo = await Insumo.create({
      Nombre: Nombre.trim(),
      Stock: Stock || 0,
      Estado: Estado !== undefined ? Estado : true,
      Tipo: Tipo,
      ...(precioTelaProcessed !== undefined ? { PrecioTela: precioTelaProcessed } : {})
    });

    res.status(201).json({
      message: 'Insumo creado exitosamente',
      insumo: nuevoInsumo
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al crear insumo',
      error: error.message
    });
  }
};

// Actualizar un insumo
exports.updateInsumo = async (req, res) => {
  try {
    const { Nombre, Stock, Estado, Tipo, PrecioTela } = req.body;

    const insumo = await Insumo.findByPk(req.params.id);

    if (!insumo) {
      return res.status(404).json({ message: 'Insumo no encontrado' });
    }

    // Si el tipo se cambia a 'Tela', entonces precio debe ser válido
    if (Tipo && String(Tipo).toLowerCase() === 'tela') {
      if (PrecioTela === undefined || PrecioTela === null || PrecioTela === '') {
        return res.status(400).json({ message: 'PrecioTela es obligatorio cuando Tipo es "Tela".' });
      }
      const p = parseFloat(PrecioTela);
      if (Number.isNaN(p) || p < 0) {
        return res.status(400).json({ message: 'PrecioTela debe ser un número >= 0.' });
      }
    }

    // Preprocesar precio si viene (permitir limpiar con null o '' -> null)
    let precioTelaProcessed = undefined;
    if (PrecioTela !== undefined) {
      if (PrecioTela === null || PrecioTela === '') {
        precioTelaProcessed = null;
      } else {
        precioTelaProcessed = parseFloat(PrecioTela);
      }
    }

    await insumo.update({
      Nombre: Nombre || insumo.Nombre,
      Stock: Stock !== undefined ? Stock : insumo.Stock,
      Estado: Estado !== undefined ? Estado : insumo.Estado,
      Tipo: Tipo || insumo.Tipo,
      ...(precioTelaProcessed !== undefined ? { PrecioTela: precioTelaProcessed } : {})
    });

    res.json({
      message: 'Insumo actualizado exitosamente',
      insumo
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al actualizar insumo',
      error: error.message
    });
  }
};

// ✅ NUEVO: Cambiar estado del insumo (CON VALIDACIÓN DE COMPRAS)
exports.cambiarEstadoInsumo = async (req, res) => {
  try {
    const { id } = req.params;
    const { Estado } = req.body;

    if (Estado === undefined || Estado === null) {
      return res.status(400).json({ message: 'El campo Estado es requerido' });
    }

    const insumo = await Insumo.findByPk(id);

    if (!insumo) {
      return res.status(404).json({ message: 'Insumo no encontrado' });
    }

    // ✅ VALIDACIÓN: Si intentan desactivar, verificar si tiene compras asociadas
    if (Estado === false || Estado === 0) {
      const comprasCount = await DetalleCompra.count({
        where: { InsumoID: id }
      });

      if (comprasCount > 0) {
        return res.status(400).json({
          message: `No se puede desactivar el insumo porque tiene ${comprasCount} compra(s) asociada(s).`,
          comprasAsociadas: comprasCount,
          permitido: false
        });
      }
    }

    // ✅ Cambiar el estado
    await insumo.update({ Estado });

    res.json({
      message: 'Estado del insumo actualizado correctamente',
      insumo
    });
  } catch (error) {
    console.error("Error al cambiar estado del insumo:", error);
    res.status(500).json({
      message: 'Error al cambiar estado del insumo',
      error: error.message
    });
  }
};

// Eliminar un insumo
exports.deleteInsumo = async (req, res) => {
    try {
        const insumo = await Insumo.findByPk(req.params.id);

        if (!insumo) {
            return res.status(404).json({ message: 'Insumo no encontrado' });
        }

        // Validar si tiene compras asociadas antes de eliminar
        const comprasCount = await DetalleCompra.count({
            where: { InsumoID: req.params.id }
        });

        if (comprasCount > 0) {
            return res.status(400).json({
                message: `No se puede eliminar el insumo porque tiene ${comprasCount} compra(s) asociada(s).`,
                comprasAsociadas: comprasCount
            });
        }

        await insumo.destroy();

        res.json({ message: 'Insumo eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({
            message: 'Error al eliminar insumo',
            error: error.message
        });
    }
};