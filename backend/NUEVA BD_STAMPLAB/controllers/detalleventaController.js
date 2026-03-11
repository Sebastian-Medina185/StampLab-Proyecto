const { DetalleVenta, Venta, Producto, Color, Talla } = require('../models');

// Obtener todos los detalles de venta
exports.getAllDetalleVentas = async (req, res) => {
    try {
        const detalleVentas = await DetalleVenta.findAll({
            include: [
                { model: Venta, as: 'venta' },
                { model: Producto, as: 'producto' },
                { model: Color, as: 'color' },  // Incluir Color
                { model: Talla, as: 'talla' }   // Incluir Talla
            ]
        });
        res.json(detalleVentas);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener detalles de venta',
            error: error.message
        });
    }
};


// Obtener un detalle de venta por ID
exports.getDetalleVentaById = async (req, res) => {
    try {
        const detalleVenta = await DetalleVenta.findByPk(req.params.id, {
            include: [
                { model: Venta, as: 'venta' },
                { model: Producto, as: 'producto' },
                { model: Color, as: 'color' },  // Incluir Color
                { model: Talla, as: 'talla' }   // Incluir Talla
            ]
        });

        if (!detalleVenta) {
            return res.status(404).json({ message: 'Detalle de venta no encontrado' });
        }

        res.json(detalleVenta);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener detalle de venta',
            error: error.message
        });
    }
};


// Crear un detalle de venta
// exports.createDetalleVenta = async (req, res) => {
//     try {
//         const { VentaID, ProductoID } = req.body;

//         const nuevoDetalle = await DetalleVenta.create({
//             VentaID,
//             ProductoID,
//         });

//         res.status(201).json({
//             message: 'Detalle de venta creado exitosamente',
//             detalleVenta: nuevoDetalle
//         });
//     } catch (error) {
//         res.status(500).json({
//             message: 'Error al crear detalle de venta',
//             error: error.message
//         });
//     }
// };
exports.createDetalleVenta = async (req, res) => {
    try {
        const { VentaID, ProductoID, ColorID, TallaID, Cantidad, PrecioUnitario } = req.body;

        // Validar que los campos obligatorios estén presentes
        if (!VentaID || !ProductoID || !Cantidad || !PrecioUnitario) {
            return res.status(400).json({ error: "Faltan datos obligatorios" });
        }

        // Crear un nuevo detalle de venta
        const nuevoDetalle = await DetalleVenta.create({
            VentaID,
            ProductoID,
            ColorID,     // Guardamos el color seleccionado
            TallaID,     // Guardamos la talla seleccionada
            Cantidad,
            PrecioUnitario
        });

        res.status(201).json({
            message: 'Detalle de venta creado exitosamente',
            detalleVenta: nuevoDetalle
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al crear detalle de venta',
            error: error.message
        });
    }
};



// Actualizar un detalle de venta
exports.updateDetalleVenta = async (req, res) => {
    try {
        const { ProductoID, ColorID, TallaID, Cantidad, PrecioUnitario } = req.body;

        // Buscar el detalle de venta por ID
        const detalleVenta = await DetalleVenta.findByPk(req.params.id);

        if (!detalleVenta) {
            return res.status(404).json({ message: 'Detalle de venta no encontrado' });
        }

        // Actualizar el detalle de venta con los nuevos valores
        await detalleVenta.update({
            ProductoID: ProductoID || detalleVenta.ProductoID,
            ColorID: ColorID || detalleVenta.ColorID,  // Actualizar el color
            TallaID: TallaID || detalleVenta.TallaID,  // Actualizar la talla
            Cantidad: Cantidad || detalleVenta.Cantidad,
            PrecioUnitario: PrecioUnitario || detalleVenta.PrecioUnitario
        });

        res.json({
            message: 'Detalle de venta actualizado exitosamente',
            detalleVenta
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al actualizar detalle de venta',
            error: error.message
        });
    }
};



// Eliminar un detalle de venta
exports.deleteDetalleVenta = async (req, res) => {
    try {
        const detalleVenta = await DetalleVenta.findByPk(req.params.id);

        if (!detalleVenta) {
            return res.status(404).json({ message: 'Detalle de venta no encontrado' });
        }

        await detalleVenta.destroy();

        res.json({ message: 'Detalle de venta eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({
            message: 'Error al eliminar detalle de venta',
            error: error.message
        });
    }
};