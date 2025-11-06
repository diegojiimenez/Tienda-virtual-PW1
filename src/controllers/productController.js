const Product = require('../models/Product');


exports.getProducts = async (req, res) => {
  try {
    const { 
      search, 
      categoria, 
      talla, 
      color, 
      precioMin, 
      precioMax,
      disponible 
    } = req.query;

    let query = {};

    // Búsqueda por texto
    if (search) {
      query.$or = [
        { nombre: { $regex: search, $options: 'i' } },
        { descripcion: { $regex: search, $options: 'i' } }
      ];
    }

    // Filtro por categoría
    if (categoria) {
      query.categoria = categoria;
    }

    // Filtro por talla
    if (talla) {
      query.tallas = talla;
    }

    // Filtro por color
    if (color) {
      query.colores = { $regex: color, $options: 'i' };
    }

    // Filtro por precio
    if (precioMin || precioMax) {
      query.precio = {};
      if (precioMin) query.precio.$gte = Number(precioMin);
      if (precioMax) query.precio.$lte = Number(precioMax);
    }

    // Filtro por disponibilidad
    if (disponible !== undefined) {
      query.disponible = disponible === 'true';
    }

    const productos = await Product.find(query)
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: productos.length,
      data: productos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('createdBy', 'nombre email');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getProductStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const inStock = await Product.countDocuments({ disponible: true, stock: { $gt: 0 } });
    const outOfStock = await Product.countDocuments({ $or: [{ disponible: false }, { stock: 0 }] });

    // Productos por categoría
    const byCategory = await Product.aggregate([
      {
        $group: {
          _id: '$categoria',
          count: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$precio', '$stock'] } }
        }
      }
    ]);

    // Productos con bajo stock
    const lowStock = await Product.find({ stock: { $lte: 10, $gt: 0 } })
      .select('nombre stock categoria precio')
      .sort({ stock: 1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        total: totalProducts,
        inStock,
        outOfStock,
        byCategory,
        lowStock
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getProductsTable = async (req, res) => {
  try {
    const products = await Product.find()
      .select('nombre categoria precio stock disponible updatedAt')
      .sort({ updatedAt: -1 });

    const formattedProducts = products.map(product => ({
      id: product._id,
      name: product.nombre,
      category: product.categoria,
      price: product.precio,
      quantity: product.stock,
      status: product.disponible && product.stock > 0 ? 'In Stock' : 'Out of Stock',
      lastRestock: product.updatedAt
    }));

    res.json({
      success: true,
      data: formattedProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.createProduct = async (req, res) => {
  try {
    req.body.updatedAt = new Date();
    
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { stock: newStock } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    if (newStock !== undefined && newStock !== product.stock) {
      req.body.updatedAt = new Date();
    } else {
      delete req.body.updatedAt;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { 
        new: true, 
        runValidators: true,
        timestamps: false 
      }
    );

    res.json({
      success: true,
      data: updatedProduct
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Producto eliminado exitosamente',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
