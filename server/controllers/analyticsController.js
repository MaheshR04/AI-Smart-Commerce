import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

/**
 * @desc    Get dashboard analytics overview stats
 * @route   GET /api/analytics/stats
 * @access  Private/Admin
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Core tallies counts
    const totalOrders = await Order.countDocuments({});
    const totalUsers = await User.countDocuments({});
    const totalProducts = await Product.countDocuments({});

    // 2. Total Revenue aggregation (Completed payments COD delivered/Paid online)
    const revenueAgg = await Order.aggregate([
      {
        $match: {
          $or: [
            { 'paymentDetails.paymentStatus': 'Completed' },
            { orderStatus: 'Delivered' },
          ],
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
        },
      },
    ]);

    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

    // 3. Monthly Revenue pipeline aggregates
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          $or: [
            { 'paymentDetails.paymentStatus': 'Completed' },
            { orderStatus: 'Delivered' },
          ],
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 }, // last 6 months
    ]);

    // Format monthly logs for frontend chart mapping
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedMonthlySales = monthlyRevenue.map((item) => {
      const monthIdx = item._id.month - 1;
      return {
        label: `${monthNames[monthIdx]} ${item._id.year}`,
        revenue: item.revenue,
        ordersCount: item.count,
      };
    }).reverse();

    // 4. Sales Distribution by Product Category
    const categorySales = await Order.aggregate([
      { $unwind: '$products' },
      {
        $lookup: {
          from: 'products',
          localField: 'products.productId',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      { $unwind: '$productDetails' },
      {
        $group: {
          _id: '$productDetails.category',
          salesAmount: { $sum: { $multiply: ['$products.price', '$products.quantity'] } },
          unitsSold: { $sum: '$products.quantity' },
        },
      },
      { $sort: { salesAmount: -1 } },
    ]);

    // 5. Low-stock inventory items list
    const lowStockAlerts = await Product.find({ stock: { $lte: 5 } }).select('name brand stock price images');

    // 6. User role demographics ratios
    const customersCount = await User.countDocuments({ role: 'customer' });
    const adminsCount = await User.countDocuments({ role: 'admin' });

    // 7. Top 5 Selling Products aggregation
    const topProducts = await Order.aggregate([
      {
        $match: {
          $or: [
            { 'paymentDetails.paymentStatus': 'Completed' },
            { orderStatus: { $ne: 'Cancelled' } },
          ],
        },
      },
      { $unwind: '$products' },
      {
        $group: {
          _id: '$products.productId',
          name: { $first: '$products.name' },
          image: { $first: '$products.image' },
          unitsSold: { $sum: '$products.quantity' },
          revenue: { $sum: { $multiply: ['$products.price', '$products.quantity'] } },
        },
      },
      { $sort: { unitsSold: -1 } },
      { $limit: 5 },
    ]);

    // 8. Payment Method Breakdown for Sales Reports
    const paymentBreakdown = await Order.aggregate([
      {
        $match: {
          $or: [
            { 'paymentDetails.paymentStatus': 'Completed' },
            { orderStatus: { $ne: 'Cancelled' } },
          ],
        },
      },
      {
        $group: {
          _id: '$paymentMethod',
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const codStats = paymentBreakdown.find(p => p._id === 'COD') || { revenue: 0, count: 0 };
    const onlineStats = paymentBreakdown.find(p => p._id === 'Razorpay') || { revenue: 0, count: 0 };

    // 9. Total Coupon Discounts Applied
    const discountAgg = await Order.aggregate([
      {
        $match: {
          orderStatus: { $ne: 'Cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          totalDiscount: { $sum: '$discountAmount' }
        }
      }
    ]);
    const totalDiscounts = discountAgg[0]?.totalDiscount || 0;

    res.json({
      success: true,
      data: {
        counters: {
          totalRevenue: Math.round(totalRevenue),
          totalOrders,
          totalUsers,
          totalProducts,
        },
        monthlySales: formattedMonthlySales,
        categorySales: categorySales.map((item) => ({
          category: item._id,
          revenue: Math.round(item.salesAmount),
          units: item.unitsSold,
        })),
        demographics: {
          customers: customersCount,
          admins: adminsCount,
        },
        lowStockAlerts,
        topProducts: topProducts.map((item) => ({
          productId: item._id,
          name: item.name,
          image: item.image,
          unitsSold: item.unitsSold,
          revenue: Math.round(item.revenue),
        })),
        reports: {
          cod: {
            revenue: Math.round(codStats.revenue),
            count: codStats.count,
          },
          online: {
            revenue: Math.round(onlineStats.revenue),
            count: onlineStats.count,
          },
          totalDiscounts: Math.round(totalDiscounts),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
