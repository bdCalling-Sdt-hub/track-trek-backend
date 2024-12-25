const { default: status } = require("http-status");
const ApiError = require("../../../error/ApiError");
const QueryBuilder = require("../../../builder/queryBuilder");
const validateFields = require("../../../util/validateFields");
const User = require("../user/user.model");
const Auth = require("../auth/auth.model");
const Payment = require("../payment/payment.model");
const Category = require("../category/category.model");
const { ENUM_USER_ROLE } = require("../../../util/enum");
const Booking = require("../booking/booking.model");
const Track = require("../track/track.model");
const Event = require("../event/event.model");

// destination ========================
const addCategory = async (req) => {
  const { files, body: data } = req;
  const { name } = data || {};

  if (!files || !files.category_image)
    throw new ApiError(status.BAD_REQUEST, "category image is required");

  let category_image;
  if (files && files.category_image)
    category_image = `/${files.category_image[0].path}`;

  const existingCategory = await Category.findOne({ name }).collation({
    locale: "en",
    strength: 2,
  });

  if (existingCategory)
    throw new ApiError(status.CONFLICT, `category ${name} exists`);

  const categoryData = { name, category_image };

  const destination = await Category.create(categoryData);
  return destination;
};

const getAllCategory = async (query) => {
  const categoryQuery = new QueryBuilder(Category.find({}).lean(), query)
    .search(["name"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const [category, meta] = await Promise.all([
    categoryQuery.modelQuery,
    categoryQuery.countTotal(),
  ]);

  return {
    meta,
    category,
  };
};

const deleteCategory = async (query) => {
  const { categoryId } = query;

  const result = await Category.deleteOne({ _id: categoryId });

  if (!result.deletedCount)
    throw new ApiError(status.NOT_FOUND, "Category not found");

  return result;
};

// overview ========================
const revenue = async (query) => {
  const { year: strYear } = query;

  validateFields(query, ["year"]);

  const year = Number(strYear);
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year + 1, 0, 1);

  const [distinctYears, revenue] = await Promise.all([
    Payment.aggregate([
      {
        $group: {
          _id: { $year: "$createdAt" },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          year: "$_id",
          _id: 0,
        },
      },
    ]),
    Payment.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lt: endDate,
          },
          status: ENUM_PAYMENT_STATUS.SUCCEEDED,
        },
      },
      {
        $project: {
          amount: 1,
          refund_amount: 1,
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          totalRevenue: {
            $sum: {
              $subtract: ["$amount", "$refund_amount"],
            },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]),
  ]);

  const totalYears = distinctYears.map((item) => item.year);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const monthlyRevenue = monthNames.reduce((acc, month) => {
    acc[month] = 0;
    return acc;
  }, {});

  revenue.forEach((r) => {
    const monthName = monthNames[r._id - 1];
    monthlyRevenue[monthName] = r.totalRevenue;
  });

  return {
    total_years: totalYears,
    monthlyRevenue,
  };
};

const totalOverview = async () => {
  const [
    totalAuth,
    totalUser,
    totalHost,
    totalEvent,
    totalTrack,
    totalEarningAgg,
  ] = await Promise.all([
    Auth.countDocuments(),
    Auth.countDocuments({ role: ENUM_USER_ROLE.USER }),
    Auth.countDocuments({ role: ENUM_USER_ROLE.HOST }),
    Event.countDocuments(),
    Track.countDocuments(),
    // Payment.aggregate([
    //   {
    //     $match: {
    //       status: ENUM_PAYMENT_STATUS.SUCCEEDED,
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: null,
    //       totalEarning: {
    //         $sum: {
    //           $subtract: ["$amount", "$refund_amount"],
    //         },
    //       },
    //     },
    //   },
    // ]),
  ]);

  // const totalEarning = totalEarningAgg[0].totalEarning
  //   ? totalEarningAgg[0].totalEarning
  //   : 0;

  return {
    totalAuth,
    totalUser,
    totalHost,
    totalEvent,
    totalTrack,
    // totalEarning,
  };
};

const businessGrowth = async (query) => {
  const { year: yearStr, data } = query;

  validateFields(query, ["year"]);

  const Model = data === "event" ? Event : Track;

  const year = Number(yearStr);
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year + 1, 0, 1);

  const months = Array.from({ length: 12 }, (_, i) =>
    new Date(0, i).toLocaleString("en", { month: "long" })
  );

  // Aggregate monthly business counts and list of all years
  const [monthlyNewEntities, distinctYears] = await Promise.all([
    Model.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfYear,
            $lt: endOfYear,
          },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          month: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]),
    Model.aggregate([
      {
        $group: {
          _id: { $year: "$createdAt" },
        },
      },
      {
        $project: {
          year: "$_id",
          _id: 0,
        },
      },
      {
        $sort: {
          year: 1,
        },
      },
    ]),
  ]);

  const total_years = distinctYears.map((item) => item.year);

  // Initialize result object with all months set to 0
  const result = months.reduce((acc, month) => ({ ...acc, [month]: 0 }), {});

  // Populate result with actual registration counts
  monthlyNewEntities.forEach(({ month, count }) => {
    result[months[month - 1]] = count;
  });

  return {
    total_years,
    monthlyNewEntities: result,
  };
};

const growth = async (query) => {
  const { year: yearStr, role } = query;

  validateFields(query, ["role", "year"]);

  const year = Number(yearStr);
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year + 1, 0, 1);

  const months = Array.from({ length: 12 }, (_, i) =>
    new Date(0, i).toLocaleString("en", { month: "long" })
  );

  // Aggregate monthly registration counts and list of all years
  const [monthlyRegistration, distinctYears] = await Promise.all([
    Auth.aggregate([
      {
        $match: {
          role: role,
          createdAt: {
            $gte: startOfYear,
            $lt: endOfYear,
          },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          month: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]),
    Auth.aggregate([
      {
        $match: {
          role: role,
        },
      },
      {
        $group: {
          _id: { $year: "$createdAt" },
        },
      },
      {
        $project: {
          year: "$_id",
          _id: 0,
        },
      },
      {
        $sort: {
          year: 1,
        },
      },
    ]),
  ]);

  const total_years = distinctYears.map((item) => item.year);

  // Initialize result object with all months set to 0
  const result = months.reduce((acc, month) => ({ ...acc, [month]: 0 }), {});

  // Populate result with actual registration counts
  monthlyRegistration.forEach(({ month, count }) => {
    result[months[month - 1]] = count;
  });

  return {
    total_years,
    monthlyRegistration: result,
  };
};

// booking ========================
const getBookings = async (query) => {
  const { data, ...newQuery } = query;
  const queryObj = {};

  if (data === "event") {
    queryObj.event = { $exists: true };
  } else {
    queryObj.track = { $exists: true };
  }

  const bookingQuery = new QueryBuilder(
    Booking.find(queryObj)
      .populate({ path: "user host eventSlot trackSlot" })
      .lean(),
    newQuery
  )
    .search(["price bookingFor"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const [bookings, meta] = await Promise.all([
    bookingQuery.modelQuery,
    bookingQuery.countTotal(),
  ]);

  return {
    meta,
    bookings,
  };
};

// user-host management ========================
const getAllUser = async (query) => {
  const { role } = query;

  validateFields(query, ["role"]);

  const allowedRoles = [ENUM_USER_ROLE.USER, ENUM_USER_ROLE.HOST];

  if (!allowedRoles.includes(role))
    throw new ApiError(status.BAD_REQUEST, "Invalid role");

  const usersQuery = new QueryBuilder(User.find().lean(), query)
    .search(["name", "email"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const [result, meta] = await Promise.all([
    usersQuery.modelQuery,
    usersQuery.countTotal(),
  ]);

  return { meta, result };
};

const getSingleUser = async (query) => {
  const { userId } = query;

  validateFields(query, ["userId"]);

  const user = await User.findById(userId);

  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  return { user };
};

const blockUnblockUser = async (payload) => {
  const { authId, isBlocked } = payload;

  validateFields(payload, ["authId", "isBlocked"]);

  const user = await Auth.findByIdAndUpdate(
    authId,
    { $set: { isBlocked } },
    {
      new: true,
      runValidators: true,
    }
  ).select("isBlocked email");

  if (!user) throw new ApiError(status.NOT_FOUND, "User not found");

  return user;
};

const DashboardService = {
  addCategory,
  getAllCategory,
  deleteCategory,
  revenue,
  businessGrowth,
  growth,
  totalOverview,
  getBookings,
  getAllUser,
  getSingleUser,
  blockUnblockUser,
};

module.exports = DashboardService;
