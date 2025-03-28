const express = require("express");
const router = express.Router();
const Order = require("../model/order");
const Product = require("../model/Products");

// POST: Create a new order 
const SalesData = require("../model/sales_data"); // Import the SalesData model

const createOrder = async (req, res) => {
  try {
    const {
      customerId,
      products,
      deliveryInfo,
      deliveryType,
      estimatedDeliveryDate,
      paymentMethod,
    } = req.body;

    const generateOrderReference = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      const random = Array.from({ length: 6 }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length))
      ).join("");
      const number = Math.floor(1000 + Math.random() * 9000);
      return `ORD-${number}-${random}`;
    };

    const orderReference = generateOrderReference();
    const paymentStatus = paymentMethod === "Khalti" ? "Paid" : "Unpaid";

    if (!customerId || !products || products.length === 0 || !deliveryInfo || !paymentMethod) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const validDeliveryTypes = ["Express Delivery", "Standard Delivery"];
    if (!validDeliveryTypes.includes(deliveryType)) {
      return res.status(400).json({ message: "Invalid delivery type." });
    }

    const validMethods = ["Cash", "Khalti"];
    if (!validMethods.includes(paymentMethod)) {
      return res.status(400).json({ message: "Invalid payment method." });
    }

    const parsedDate = new Date(estimatedDeliveryDate);
    if (isNaN(parsedDate)) {
      return res.status(400).json({ message: "Invalid delivery date." });
    }

    const productDetails = await Promise.all(
      products.map(async (p) => {
        const prod = await Product.findById(p.productId);
        if (!prod) {
          throw new Error(`Invalid product ID: ${p.productId}`);
        }
        return {
          ...p,
          price: prod.price,
          name: prod.name,
          category: prod.category,
          gender: prod.gender,
          season: prod.season,
        };
      })
    );

    const subtotal = productDetails.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    const deliveryCharge = deliveryType === "Express Delivery" ? 300 : 150;
    const discount = 200;
    const tax = 50;
    const totalAmount = subtotal + deliveryCharge + tax - discount;

    const order = await Order.create({
      customerId,
      orderReference,
      products: productDetails,
      deliveryInfo,
      deliveryType,
      estimatedDeliveryDate: parsedDate,
      subtotal,
      deliveryCharge,
      discount,
      tax,
      totalAmount,
      status: "Pending",
      paymentStatus,
      paymentMethod,
    });

    // ✅ UPDATE SALES_DATA for each product
    for (const item of productDetails) {
      const { productId, name, category, gender, season, price, quantity } = item;

      const salesEntry = await SalesData.findOne({ product_id: productId });

      const saleRecord = {
        date: new Date(),
        quantity,
        revenue: price * quantity,
      };

      if (salesEntry) {
        // Update existing entry
        salesEntry.historical_sales.push(saleRecord);
        salesEntry.total_quantity_sold += quantity;
        salesEntry.total_revenue += price * quantity;
        salesEntry.last_updated = new Date();
        await salesEntry.save();
      } else {
        // Create new sales entry
        await SalesData.create({
          product_id: productId,
          product_name: name,
          category,
          gender,
          season,
          price,
          historical_sales: [saleRecord],
          total_quantity_sold: quantity,
          total_revenue: price * quantity,
          last_updated: new Date(),
        });
      }
    }

    res.status(201).json({ message: "Order placed successfully", order });
    console.log("✅ Order successfully placed!");
  } catch (error) {
    console.error("❌ Error creating order:", error.message);

    if (error.message.startsWith("Invalid product ID")) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Internal server error." });
  }
};

  

const deleteorder = async (req, res) => {
    try {
        const orders = await Order.find({ customerId: req.params.customerId })
          .sort({ createdAt: -1 })
          .populate("products.productId", "name images price");
    
        res.json(orders);
      } catch (err) {
        res.status(500).json({ message: "Failed to fetch orders" });
      }}


// GET: Single Order by ID
const getorder = async (req, res) =>{
    try {
        const order = await Order.findById(req.params.orderId)
          .populate("products.productId", "name images price");
    
        if (!order) return res.status(404).json({ message: "Order not found" });
    
        res.json(order);
      } catch (err) {
        res.status(500).json({ message: "Error fetching order" });
      }
}
const updateorder = async (req, res) => {
    try {
        const { status } = req.body;
    
        const order = await Order.findByIdAndUpdate(
          req.params.orderId,
          { status },
          { new: true }
        );
    
        res.json(order);
      } catch (err) {
        res.status(500).json({ message: "Failed to update order status" });
      }
}

  
module.exports = {createOrder, deleteorder, getorder, updateorder};
