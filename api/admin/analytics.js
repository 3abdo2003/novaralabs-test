import clientPromise from '../utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { period = '30d' } = req.query;

  try {
    const client = await clientPromise;
    const db = client.db("NovaraLabs");

    // Calculate date filter
    let dateFilter = {};
    if (period !== 'all') {
      const now = new Date();
      now.setHours(23, 59, 59, 999); // End of today
      
      let startDate = new Date();
      if (period === '7d') startDate.setDate(now.getDate() - 7);
      else if (period === '30d') startDate.setDate(now.getDate() - 30);
      else if (period === '90d') startDate.setDate(now.getDate() - 90);
      else if (period === '1y') startDate.setFullYear(now.getFullYear() - 1);
      
      startDate.setHours(0, 0, 0, 0); // Start of the period day
      dateFilter = { createdAt: { $gte: startDate } };
    }

    const baseMatch = { region: "EG", ...dateFilter };

    // Aggregates for Egypt with date filter
    const totalOrders = await db.collection("orders").countDocuments(baseMatch);
    
    // Revenue & Trends
    const totalRevenueResult = await db.collection("orders").aggregate([
      { $match: baseMatch },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]).toArray();
    const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;
    
    // 1. Sales Overview
    const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const regionalData = await db.collection("orders").aggregate([
      { $match: dateFilter },
      { $group: { _id: "$shipping.governorate", count: { $sum: 1 }, revenue: { $sum: "$total" } } }
    ]).toArray();

    // 2. Product Performance
    const productStatsRaw = await db.collection("orders").aggregate([
      { $match: baseMatch },
      { $unwind: "$items" },
      { $group: { 
          _id: "$items.name", 
          totalQty: { $sum: "$items.quantity" },
          itemPrices: { $push: { p: "$items.price", q: "$items.quantity" } }
      }}
    ]).toArray();

    const productStats = productStatsRaw.map(stat => ({
      _id: stat._id,
      totalQty: stat.totalQty,
      revenue: stat.itemPrices.reduce((sum, item) => {
        const priceNum = parseFloat(item.p.replace(/[^0-9.]/g, '')) || 0;
        return sum + (priceNum * item.q);
      }, 0)
    })).sort((a, b) => b.totalQty - a.totalQty);

    const topProducts = productStats.slice(0, 5);
    const bottomProducts = productStats.slice(-5).reverse();

    // 3. Inventory Insights
    const inventory = await db.collection("inventoryitems").find({}).toArray();
    
    const outOfStockCount = inventory.filter(item => {
        // Base case: item.stock is <= 0
        const isBaseOutOfStock = (item.stock || 0) <= 0;
        
        // If it has variants, we check if ALL variants are out of stock
        if (item.sizesEG && item.sizesEG.length > 0) {
            const allVariantsOutOfStock = item.sizesEG.every(v => (v.stock || 0) <= 0);
            return allVariantsOutOfStock;
        }
        
        return isBaseOutOfStock;
    }).length;

    const inventoryValue = inventory.reduce((sum, item) => {
        const price = parseFloat(item.price) || 0;
        const stock = item.sizesEG && item.sizesEG.length > 0
            ? item.sizesEG.reduce((s, v) => s + (v.stock || 0), 0)
            : (item.stock || 0);
        return sum + (price * stock);
    }, 0);

    // Dynamic Aggregation for Trends
    let dateFormat = "%Y-%m-%d"; // Default: Daily
    if (period === '1y' || period === 'all') dateFormat = "%Y-%m"; // Monthly

    const trendsData = await db.collection("orders").aggregate([
      { $match: baseMatch },
      { $group: {
          _id: { $dateToString: { format: dateFormat, date: "$createdAt", timezone: "+02:00" } },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 }
      }},
      { $sort: { "_id": 1 } }
    ]).toArray();

    // Gap Filling Logic
    let trends = [];
    
    const now = new Date();
    let current = new Date();
    if (period === '7d') current.setDate(now.getDate() - 7);
    else if (period === '30d') current.setDate(now.getDate() - 30);
    else if (period === '90d') current.setDate(now.getDate() - 90);
    else if (period === '1y') current.setFullYear(now.getFullYear() - 1);
    else if (period === 'all' && trendsData.length > 0) {
        // For 'all', start from the first order found
        const [y, m] = trendsData[0]._id.split('-');
        current = new Date(parseInt(y), parseInt(m) - 1, 1);
    } else if (period === 'all') {
        current = new Date();
    }

    const end = new Date();
    
    // Normalize current to start of period
    if (dateFormat === "%Y-%m-%d") current.setHours(0,0,0,0);
    else current.setDate(1);

    while (current <= end) {
      let key;
      if (dateFormat === "%Y-%m-%d") {
          key = `${current.getFullYear()}-${(current.getMonth() + 1).toString().padStart(2, '0')}-${current.getDate().toString().padStart(2, '0')}`;
      } else {
          key = `${current.getFullYear()}-${(current.getMonth() + 1).toString().padStart(2, '0')}`;
      }

      const match = trendsData.find(t => t._id === key);
      trends.push({
          _id: key,
          revenue: match ? match.revenue : 0,
          orders: match ? match.orders : 0
      });

      // Increment current
      if (dateFormat === "%Y-%m-%d") current.setDate(current.getDate() + 1);
      else current.setMonth(current.getMonth() + 1);
    }

    res.status(200).json({
      success: true,
      data: {
        kpis: {
            totalOrders,
            totalRevenue,
            totalProducts: inventory.length,
            lowStockProducts: inventory.filter(item => {
                const totalStock = item.sizesEG && item.sizesEG.length > 0
                    ? item.sizesEG.reduce((s, v) => s + (v.stock || 0), 0)
                    : (item.stock || 0);
                return totalStock > 0 && totalStock < 10;
            }).length,
            outOfStockCount,
            inventoryValue,
            aov
        },
        trends,
        topProducts,
        bottomProducts,
        regionalData,
        recentOrders: await db.collection("orders")
          .find(baseMatch)
          .sort({ createdAt: -1 })
          .limit(5)
          .toArray()
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}
