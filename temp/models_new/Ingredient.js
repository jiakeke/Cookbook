const mongoose = require('mongoose');

const IngredientSchema = new mongoose.Schema({
  name: {
    en: { type: String, required: true },
    fi: { type: String },
    zh: { type: String },
  },
  image: {
    type: String,
  },
  link: [
    {
      uri: { type: String }, // 商品购买链接
      price: { type: Number }, // 当前价格
      size: { type: String }, // 包装规格（如500g、1kg）
      pricePerKg: { type: Number }, // 每公斤价格（新增字段）
      promotion: { type: String }, // 当前活动描述（新增字段）,后续当前活动是跟着不同店铺走的，这块数据怎么做合适？
      store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'store', // 关联商店模型
      },

    },
  ],

  // 关联过敏原集合（多个）
  allergens: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Allergen', // 引用 Allergen 模型
    },
  ],

  // 关联特殊人群集合（多个）
  specialGroups: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SpecialGroup', // 引用 SpecialGroup 模型
    },
  ],
});

module.exports = mongoose.model('ingredient', IngredientSchema);
